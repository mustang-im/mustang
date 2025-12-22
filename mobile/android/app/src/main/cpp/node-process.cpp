#include <jni.h>
#include <node.h>

using namespace std;

// Copy arguments to one contiguous memory
jint startNode(JNIEnv *env,
               jobject /* this */,
               jobjectArray args) {

    // Argument count
    jsize argc = env->GetArrayLength(args);

    char** argv = new char*[argc];

    for (int i = 0; i < argc; i++) {
        jstring arg = static_cast<jstring>(env->GetObjectArrayElement(args, i));
        jsize argLen = env->GetStringUTFLength(arg);


        argv[i] = new char[argLen + 1];

        // Copy argument to argv directly and release reference automatically
        // <https://developer.android.com/ndk/guides/jni-tips#region-calls>
        env->GetStringUTFRegion(arg, 0, argLen, argv[i]);
        // Append null terminator needed by C++
        argv[i][argLen] = '\0';

        // Always to remove the reference
        env->DeleteLocalRef(arg);
    }

    int exitCode = node::Start(argc, argv);
    return jint(exitCode);
}

// Called by System.loadLibrary("node-process")
// Registers native methods in the Kotlin class without letting
// <https://developer.android.com/ndk/guides/jni-tips#native-libraries>
JNIEXPORT jint JNI_OnLoad(JavaVM* vm, void* reserved) {
    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR;
    }

    // Find the NodeProcess class
    jclass c = env->FindClass("im/mustang/capa/nodeprocess/NodeProcess");
    if (c == nullptr) return JNI_ERR;

    // Register your class' native methods.
    static const JNINativeMethod methods[] = {
            {"startNode", "([Ljava/lang/String;)I", reinterpret_cast<jint*>(startNode)},
    };

    int rc = env->RegisterNatives(c, methods, sizeof(methods)/sizeof(JNINativeMethod));
    if (rc != JNI_OK) return rc;

    return JNI_VERSION_1_6;
}
