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

void *thread_stderr_func(void*) {
    ssize_t redirect_size;
    char buf[2048];
    while((redirect_size = read(pipe_stderr[0], buf, sizeof buf - 1)) > 0) {
        //__android_log will add a new line anyway.
        if(buf[redirect_size - 1] == '\n')
            --redirect_size;
        buf[redirect_size] = 0;
        __android_log_write(ANDROID_LOG_ERROR, ADBTAG, buf);
    }
    return 0;
}

void *thread_stdout_func(void*) {
    ssize_t redirect_size;
    char buf[2048];
    while((redirect_size = read(pipe_stdout[0], buf, sizeof buf - 1)) > 0) {
        //__android_log will add a new line anyway.
        if(buf[redirect_size - 1] == '\n')
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

    if(pthread_create(&thread_stdout, 0, thread_stdout_func, 0) == -1)
        return -1;
    pthread_detach(thread_stdout);

    if(pthread_create(&thread_stderr, 0, thread_stderr_func, 0) == -1)
        return -1;
    pthread_detach(thread_stderr);

    return 0;
}

static Environment* nodeEnv = nullptr;

int RunNodeInstance(MultiIsolatePlatform* platform,
                    const std::vector<std::string>& args,
                    const std::vector<std::string>& exec_args) {
    int exit_code = 0;

    // Setup up a libuv event loop, v8::Isolate, and Node.js Environment.
    std::vector<std::string> errors;
    std::unique_ptr<CommonEnvironmentSetup> setup =
            CommonEnvironmentSetup::Create(platform, &errors, args, exec_args);
    if (!setup) {
        for (const std::string& err : errors)
            fprintf(stderr, "%s: %s\n", args[0].c_str(), err.c_str());
        return 1;
    }

    Isolate* isolate = setup->isolate();
    nodeEnv = setup->env();

    {
        Locker locker(isolate);
        Isolate::Scope isolate_scope(isolate);
        HandleScope handle_scope(isolate);
        // The v8::Context needs to be entered when node::CreateEnvironment() and
        // node::LoadEnvironment() are being called.
        Context::Scope context_scope(setup->context());

        // Set up the Node.js instance for execution, and run code inside of it.
        // There is also a variant that takes a callback and provides it with
        // the `require` and `process` objects, so that it can manually compile
        // and run scripts as needed.
        // The `require` function inside this script does *not* access the file
        // system, and can only load built-in Node.js modules.
        // `module.createRequire()` is being used to create one that is able to
        // load files from the disk, and uses the standard CommonJS file loader
        // instead of the internal-only `require` function.
        MaybeLocal<Value> loadenv_ret = node::LoadEnvironment(
                nodeEnv,
                "(async () => { await import(process.argv[1]); })().catch(e => { console.error(e); process.exit(1); });");


        if (loadenv_ret.IsEmpty())  // There has been a JS exception.
            return 1;

        exit_code = node::SpinEventLoop(nodeEnv).FromMaybe(1);

        // node::Stop() can be used to explicitly stop the event loop and keep
        // further JavaScript from running. It can be called from any thread,
        // and will act like worker.terminate() if called from another thread.
        node::Stop(nodeEnv);
    }

    return exit_code;
}

int startNode(int argc, char** argv) {
    argv = uv_setup_args(argc, argv);
    std::vector<std::string> args(argv, argv + argc);
    // Parse Node.js CLI options, and print any errors that have occurred while
    // trying to parse them.
    std::shared_ptr<node::InitializationResult> result =
            node::InitializeOncePerProcess(args, {
                    node::ProcessInitializationFlags::kNoInitializeV8,
                    node::ProcessInitializationFlags::kNoInitializeNodeV8Platform
            });

    for (const std::string& error : result->errors())
        fprintf(stderr, "%s: %s\n", args[0].c_str(), error.c_str());
    if (result->early_return() != 0) {
        return result->exit_code();
    }

    // Create a v8::Platform instance. `MultiIsolatePlatform::Create()` is a way
    // to create a v8::Platform instance that Node.js can use when creating
    // Worker threads. When no `MultiIsolatePlatform` instance is present,
    // Worker threads are disabled.
    std::unique_ptr<MultiIsolatePlatform> platform =
            MultiIsolatePlatform::Create(4);
    V8::InitializePlatform(platform.get());
    V8::Initialize();

    // See below for the contents of this function.
    int ret = RunNodeInstance(
            platform.get(), result->args(), result->exec_args());

    V8::Dispose();
    V8::DisposePlatform();

    node::TearDownOncePerProcess();
    return ret;
}

//node's libUV requires all arguments being on contiguous memory.
extern "C" jint JNICALL
Java_im_mustang_capa_NodeJS_startNode(
        JNIEnv *env,
        jobject /* this */,
        jobjectArray arguments) {

    //argc
    jsize argument_count = env->GetArrayLength(arguments);

    //Compute byte size need for all arguments in contiguous memory.
    int c_arguments_size = 0;
    for (int i = 0; i < argument_count ; i++) {
        c_arguments_size += strlen(env->GetStringUTFChars((jstring)env->GetObjectArrayElement(arguments, i), 0));
        c_arguments_size++; // for '\0'
    }

    //Stores arguments in contiguous memory.
    char* args_buffer = (char*) calloc(c_arguments_size, sizeof(char));

    //argv to pass into node.
    char* argv[argument_count];

    //To iterate through the expected start position of each argument in args_buffer.
    char* current_args_position = args_buffer;

    //Populate the args_buffer and argv.
    for (int i = 0; i < argument_count ; i++)
    {
        const char* current_argument = env->GetStringUTFChars((jstring)env->GetObjectArrayElement(arguments, i), 0);

        //Copy current argument to its expected position in args_buffer
        strncpy(current_args_position, current_argument, strlen(current_argument));

        //Save current argument start position in argv
        argv[i] = current_args_position;

        //Increment to the next argument's expected position.
        current_args_position += strlen(current_args_position) + 1;
    }

    //Start threads to show stdout and stderr in logcat.
    if (start_redirecting_stdout_stderr()==-1) {
        __android_log_write(ANDROID_LOG_ERROR, ADBTAG, "Couldn't start redirecting stdout and stderr to logcat.");
    }

    //Start node, with argc and argv.
    int node_result = startNode(argument_count, argv);
    free(args_buffer);

    return jint(node_result);

}

extern "C" void JNICALL
Java_im_mustang_capa_NodeJS_stopNode(
        JNIEnv *env,
        jobject /* this */) {
    node::Stop(nodeEnv);
    V8::Dispose();
    V8::DisposePlatform();
    node::TearDownOncePerProcess();
    nodeEnv = nullptr;
}