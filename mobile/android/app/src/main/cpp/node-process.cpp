#include <jni.h>
#include <node.h>
#include <vector>
#include <string>

using namespace std;

jint startNode(JNIEnv *env,
               jobject /* this */,
               jobjectArray args) {
    jsize argc = env->GetArrayLength(args);

    vector<char*> argv(argc);

    for (int i = 0; i < argc; i++) {
        jstring arg = static_cast<jstring>(env->GetObjectArrayElement(args, i));
        jsize argLen = env->GetStringUTFLength(arg);


        argv[i] = new char[argLen + 1];

        env->GetStringUTFRegion(arg, 0, argLen, argv[i]);
        argv[i][argLen] = '\0';

        env->DeleteLocalRef(arg);
    }

    return jint(node::Start(argc, argv.data()));
}

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
