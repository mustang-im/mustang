#include <jni.h>
#include <string>
#include <vector>  // Include vector
#include "node.h"

extern "C"
JNIEXPORT void JNICALL
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
    node::Start(argv.size(), argv.data());

    // All memory in argv_data and argv is automatically cleaned up here!
}


JNIEXPORT jint JNI_ON_LOAD(JavaVM *vm, void *reserved) {
    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR;
    }
    // Find your class. JNI_OnLoad is called from the correct class loader context for this to work.
    jclass c = env->FindClass("im/mustang/capa/NodeProcess");
    if (c == nullptr) return JNI_ERR;

    // Register your class' native methods.
    static const JNINativeMethod methods[] = {
            {"startNode", "([Ljava/lang/String;)V", (void*)Java_im_mustang_capa_NodeProcess_startNode}
    };
    int rc = env->RegisterNatives(c, methods, sizeof(methods)/sizeof(JNINativeMethod));
    if (rc != JNI_OK) return rc;
    return JNI_VERSION_1_6;
}
