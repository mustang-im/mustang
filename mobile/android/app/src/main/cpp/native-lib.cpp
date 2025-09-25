// Do not forget to dynamically load the C++ library into your application.
//
// For instance,
//
// In MainActivity.java:
//    static {
//       System.loadLibrary("capa");
//    }
//
// Or, in MainActivity.kt:
//    companion object {
//      init {
//         System.loadLibrary("capa")
//      }
//    }

// From <https://nodejs.org/api/embedding.html> example
// From <https://nodejs-mobile.github.io/docs/guide/guide-android/building-complex> example

#include <jni.h>
#include <string>
#include <cstdlib>
#include "node.h"
#include <pthread.h>
#include <unistd.h>
#include <android/log.h>
#include <cassert>
#include "cppgc/platform.h"
#include "node.h"
#include "uv.h"

#include <algorithm>

using node::CommonEnvironmentSetup;
using node::Environment;
using node::MultiIsolatePlatform;
using v8::Context;
using v8::HandleScope;
using v8::Isolate;
using v8::Locker;
using v8::MaybeLocal;
using v8::V8;
using v8::Value;

int pipe_stdout[2];
int pipe_stderr[2];
pthread_t thread_stdout;
pthread_t thread_stderr;
const char *ADBTAG = "NodeJS-Mobile";

void *thread_stderr_func(void *) {
    ssize_t redirect_size;
    char buf[2048];
    while ((redirect_size = read(pipe_stderr[0], buf, sizeof buf - 1)) > 0) {
        //__android_log will add a new line anyway.
        if (buf[redirect_size - 1] == '\n')
            --redirect_size;
        buf[redirect_size] = 0;
        __android_log_write(ANDROID_LOG_ERROR, ADBTAG, buf);
    }
    return 0;
}

void *thread_stdout_func(void *) {
    ssize_t redirect_size;
    char buf[2048];
    while ((redirect_size = read(pipe_stdout[0], buf, sizeof buf - 1)) > 0) {
        //__android_log will add a new line anyway.
        if (buf[redirect_size - 1] == '\n')
            --redirect_size;
        buf[redirect_size] = 0;
        __android_log_write(ANDROID_LOG_INFO, ADBTAG, buf);
    }
    return 0;
}

int start_redirecting_stdout_stderr() {
    //set stdout as unbuffered.
    setvbuf(stdout, 0, _IONBF, 0);
    pipe(pipe_stdout);
    dup2(pipe_stdout[1], STDOUT_FILENO);

    //set stderr as unbuffered.
    setvbuf(stderr, 0, _IONBF, 0);
    pipe(pipe_stderr);
    dup2(pipe_stderr[1], STDERR_FILENO);

    if (pthread_create(&thread_stdout, 0, thread_stdout_func, 0) == -1)
        return -1;
    pthread_detach(thread_stdout);

    if (pthread_create(&thread_stderr, 0, thread_stderr_func, 0) == -1)
        return -1;
    pthread_detach(thread_stderr);

    return 0;
}

// Global platform pointer
std::unique_ptr<MultiIsolatePlatform> platform;

void InitializeV8() {
    if (platform) return;

    // Create a v8::Platform instance. `MultiIsolatePlatform::Create()` is a way
    // to create a v8::Platform instance that Node.js can use when creating
    // Worker threads. When no `MultiIsolatePlatform` instance is present,
    // Worker threads are disabled.
    platform = MultiIsolatePlatform::Create(1);
    V8::InitializePlatform(platform.get());
    V8::Initialize();
}

void DisposeV8() {
    if (!platform) return;

    v8::V8::Dispose();
    v8::V8::DisposePlatform();
    platform.reset();
}

node::Environment *RunNodeInstance(MultiIsolatePlatform *platform,
                                   const std::vector<std::string> &args,
                                   const std::vector<std::string> &exec_args) {
    std::vector<std::string> errors;

    std::unique_ptr<node::CommonEnvironmentSetup> setup =
            node::CommonEnvironmentSetup::Create(platform, &errors, args, exec_args);
    if (!setup) {
        for (const auto &err: errors) std::fprintf(stderr, "Error: %s\n", err.c_str());
        return nullptr;
    }
    v8::Isolate *isolate = setup->isolate();
    node::Environment *env = setup->env();

    v8::Locker locker(isolate);
    v8::Isolate::Scope isolate_scope(isolate);
    v8::HandleScope handle_scope(isolate);
    v8::Context::Scope context_scope(setup->context());

    v8::MaybeLocal<v8::Value> load_result = node::LoadEnvironment(
            env,
            "import(process.argv[1]).catch(e => { console.error(e); process.exit(1); });"
    );

    if (load_result.IsEmpty()) {
        std::fprintf(stderr, "Failed to load JS environment\n");
        return nullptr;
    }

    return env;
}


node::Environment *runNodeEnv(int argc, char **argv) {
    argv = uv_setup_args(argc, argv);
    std::vector<std::string> args(argv, argv + argc);

    auto init_res =
            node::InitializeOncePerProcess(args, {
                    node::ProcessInitializationFlags::kNoInitializeV8,
                    node::ProcessInitializationFlags::kNoInitializeNodeV8Platform
            });

    if (init_res->early_return() != 0) {
        return nullptr;
    }

    // Run embedded environment (single-threaded)
    node::Environment *env = RunNodeInstance(platform.get(), init_res->args(),
                                             init_res->exec_args());
    if (!env) {
        std::fprintf(stderr, "Could not create Node environment\n");
        DisposeV8();
        return nullptr;
    }

    return env;
}

extern "C" void JNICALL
Java_im_mustang_capa_NodeJS_initializeV8(
        JNIEnv *env,
        jobject /* this */) {
    InitializeV8();
}

//node's libUV requires all arguments being on contiguous memory.
extern "C" jlong JNICALL
Java_im_mustang_capa_NodeJS_runNodeEnv(
        JNIEnv *env,
        jobject /* this */,
        jobjectArray arguments) {

    //argc
    jsize argument_count = env->GetArrayLength(arguments);

    //Compute byte size need for all arguments in contiguous memory.
    int c_arguments_size = 0;
    for (int i = 0; i < argument_count; i++) {
        c_arguments_size += strlen(
                env->GetStringUTFChars((jstring) env->GetObjectArrayElement(arguments, i), 0));
        c_arguments_size++; // for '\0'
    }

    //Stores arguments in contiguous memory.
    char *args_buffer = (char *) calloc(c_arguments_size, sizeof(char));

    //argv to pass into node.
    char *argv[argument_count];

    //To iterate through the expected start position of each argument in args_buffer.
    char *current_args_position = args_buffer;

    //Populate the args_buffer and argv.
    for (int i = 0; i < argument_count; i++) {
        jstring arg_jstr = (jstring) env->GetObjectArrayElement(arguments, i);
        jsize arg_len = env->GetStringUTFLength(arg_jstr);
        env->GetStringUTFRegion(arg_jstr, 0, arg_len, current_args_position);
        argv[i] = current_args_position;
        current_args_position += arg_len + 1;
        env->DeleteLocalRef(arg_jstr);
    }

    //Start threads to show stdout and stderr in logcat.
    if (start_redirecting_stdout_stderr() == -1) {
        __android_log_write(ANDROID_LOG_ERROR, ADBTAG,
                            "Couldn't start redirecting stdout and stderr to logcat.");
    }

    //Run node env
    node::Environment *nodeEnvPtr = runNodeEnv(argument_count, argv);
    free(args_buffer);

    return jlong(nodeEnvPtr);
}

extern "C" jint JNICALL
Java_im_mustang_capa_NodeJS_spinNodeEventLoop(
        JNIEnv *env,
        jobject /* this */,
        jlong nodeEnvPtr) {
    node::Environment *nodeEnv = reinterpret_cast<node::Environment *>(nodeEnvPtr);
    int exit_code = node::SpinEventLoop(nodeEnv).FromMaybe(1);
    return jint(exit_code);
}

extern "C" void JNICALL
Java_im_mustang_capa_NodeJS_stopNode(
        JNIEnv *env,
        jobject /* this */,
        jlong nodeEnvPtr
) {
    node::Environment *nodeEnv = reinterpret_cast<node::Environment *>(nodeEnvPtr);
    if (nodeEnv) {
        node::Stop(nodeEnv);
    }
}

extern "C" void JNICALL
Java_im_mustang_capa_NodeJS_disposeV8(
        JNIEnv *env,
        jobject /* this */) {
    DisposeV8();
}