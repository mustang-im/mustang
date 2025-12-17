#include <jni.h>
#include <string>
#include <vector>  // Include vector
#include "node.h"
#include <pthread.h>
#include <unistd.h>
#include <jni.h>
#include <stdio.h>

static JavaVM* g_vm;
static jclass g_node_process_instance;
static jclass loggerClass;
static jmethodID debugMethod;
static jmethodID errorMethod;

// Store pipes globally
static int pipe_stdout[2];
static int pipe_stderr[2];

void* capacitor_logger_thread(void* args) {
    int* fd_ptr = (int*)args;
    int fd = *fd_ptr;

    JNIEnv* env;
    // Standard 2025 NDK practice: Attach native thread to JVM
    if (g_vm->AttachCurrentThread(&env, NULL) != JNI_OK) return NULL;

    char buf[1024];
    ssize_t rdsz;
    while((rdsz = read(fd, buf, sizeof(buf) - 1)) > 0) {
        if(buf[rdsz - 1] == '\n') --rdsz;
        buf[rdsz] = 0;

        jstring jmsg = env->NewStringUTF(buf);
        // Choose Capacitor Logger method based on stream
        if (fd == pipe_stdout[0]) {
            env->CallVoidMethod(g_node_process_instance, debugMethod, jmsg);
        } else {
            env->CallVoidMethod(g_node_process_instance, errorMethod, jmsg);
        }
        env->DeleteLocalRef(jmsg);
    }

    g_vm->DetachCurrentThread();
    return NULL;
}

extern "C" JNIEXPORT void JNICALL
Java_im_mustang_capa_NodeProcess_initCapacitorRedirect(JNIEnv* env, jobject thiz) {

    // NEW: Store the instance of NodeProcess as a global reference
    g_node_process_instance = static_cast<jclass>(env->NewGlobalRef(thiz));
    if (g_node_process_instance == nullptr) {
        // Handle error
        return;
    }

    // 1. Get the class from the object instance
    jclass localClass = env->GetObjectClass(thiz);
    if (localClass == nullptr) {
        // Handle error: class not found
        env->DeleteGlobalRef(g_node_process_instance); // Clean up
        return;
    }

    // 2. Create a global reference to the class for use in other threads
    loggerClass = (jclass)env->NewGlobalRef(localClass);
    if (loggerClass == nullptr) {
        // Handle error: failed to create global ref
        env->DeleteLocalRef(localClass);
        return;
    }

    // 3. Find the method IDs using the valid class reference
    debugMethod = env->GetMethodID(loggerClass, "webViewConsoleLog", "(Ljava/lang/String;)V");
    errorMethod = env->GetMethodID(loggerClass, "webViewConsoleError", "(Ljava/lang/String;)V");

    // Clean up the local reference now that we have a global one
    env->DeleteLocalRef(localClass);

    // ... (rest of the function for pipe setup and thread creation is okay) ...
    // 2. Setup stdout redirection
    setvbuf(stdout, 0, _IONBF, 0);
    pipe(pipe_stdout);
    dup2(pipe_stdout[1], STDOUT_FILENO);

    // 3. Setup stderr redirection
    setvbuf(stderr, 0, _IONBF, 0);
    pipe(pipe_stderr);
    dup2(pipe_stderr[1], STDERR_FILENO);

    // 4. Start threads
    pthread_t t1, t2;
    pthread_create(&t1, NULL, capacitor_logger_thread, &pipe_stdout[0]);
    pthread_detach(t1);
    pthread_create(&t2, NULL, capacitor_logger_thread, &pipe_stderr[0]);
    pthread_detach(t2);
}


extern "C"
JNIEXPORT int JNICALL
Java_im_mustang_capa_NodeProcess_startNode(JNIEnv *env, jobject thiz, jobjectArray args) {
    // 1. Get the number of arguments
    jsize argc = env->GetArrayLength(args);

    // 2. Use std::vector for safe, automatic memory management
    std::vector<std::vector<char>> argv_data; // Stores the actual character data for each argument
    argv_data.reserve(argc);

    std::vector<char*> argv; // The final array of pointers for node::Start
    argv.reserve(argc);

    // 3. Process each argument using regions
    for (jsize i = 0; i < argc; i++) {
        jstring arg_jstring = (jstring)env->GetObjectArrayElement(args, i);

        // Safety check for null arguments in the Java array
        if (arg_jstring == nullptr) {
            continue;
        }

        // Get the length of the string in UTF-8 bytes (this is NOT the character count)
        const jsize utf_len = env->GetStringUTFLength(arg_jstring);

        // Create a buffer that is one byte longer for the null terminator
        std::vector<char> buffer(utf_len + 1);

        // Copy the string data into our buffer using the region call
        env->GetStringUTFRegion(arg_jstring, 0, utf_len, buffer.data());

        // MANUALLY add the null terminator
        buffer[utf_len] = '\0';

        // Store the buffer in our data vector
        argv_data.push_back(std::move(buffer));

        // No Release call is needed for GetStringUTFRegion!

        // Immediately release the JNI local reference to the jstring
        env->DeleteLocalRef(arg_jstring);
    }

    // 4. Build the final argv for node::Start
    for(auto& data : argv_data) {
        argv.push_back(data.data());
    }

    // 5. Call the node function
    return jint(node::Start(argv.size(), argv.data()));

    // All memory in argv_data and argv is automatically cleaned up here!
}

extern "C" JNIEXPORT void JNICALL
Java_im_mustang_capa_NodeProcess_cleanup(JNIEnv* env, jobject thiz) {
    if (g_node_process_instance != nullptr) {
        env->DeleteGlobalRef(g_node_process_instance);
        g_node_process_instance = nullptr;
    }
    if (loggerClass != nullptr) {
        env->DeleteGlobalRef(loggerClass);
        loggerClass = nullptr;
    }
}


JNIEXPORT jint JNI_OnLoad(JavaVM *vm, void *reserved) {
    g_vm = vm;
    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR;
    }
    // Find your class. JNI_OnLoad is called from the correct class loader context for this to work.
    jclass c = env->FindClass("im/mustang/capa/NodeProcess");
    if (c == nullptr) return JNI_ERR;

    // Register your class' native methods.
    static const JNINativeMethod methods[] = {
            {"startNode", "([Ljava/lang/String;)I", (void*)Java_im_mustang_capa_NodeProcess_startNode}
    };
    int rc = env->RegisterNatives(c, methods, sizeof(methods)/sizeof(JNINativeMethod));
    if (rc != JNI_OK) return rc;
    return JNI_VERSION_1_6;
}
