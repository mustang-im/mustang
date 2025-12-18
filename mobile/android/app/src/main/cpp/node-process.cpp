#include <jni.h>
#include <unistd.h>
#include <cstdio>
#include "node.h"
#include <vector>
#include <string>

// --- Globals for caching JNI lookups ---
static jclass g_pfd_class = nullptr;
static jmethodID g_get_fd_method = nullptr;

// JNI_OnLoad is called once when the library is loaded. Perfect for caching.
extern "C" JNIEXPORT jint JNICALL
JNI_OnLoad(JavaVM *vm, void *reserved) {
    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR;
    }

    // Find and cache the ParcelFileDescriptor class and getFd method
    jclass pfd_class_local = env->FindClass("android/os/ParcelFileDescriptor");
    if (pfd_class_local == nullptr) return JNI_ERR;
    g_pfd_class = (jclass)env->NewGlobalRef(pfd_class_local);
    env->DeleteLocalRef(pfd_class_local);
    if (g_pfd_class == nullptr) return JNI_ERR;

    g_get_fd_method = env->GetMethodID(g_pfd_class, "getFd", "()I");
    if (g_get_fd_method == nullptr) return JNI_ERR;

    return JNI_VERSION_1_6;
}

// --- Optimized Native Methods ---
extern "C" JNIEXPORT void JNICALL
Java_im_mustang_capa_NodeProcess_redirectStdout(JNIEnv* env, jobject thiz, jobject parcelFileDescriptor) {
    if (parcelFileDescriptor == nullptr || g_get_fd_method == nullptr) return;
    int fd = env->CallIntMethod(parcelFileDescriptor, g_get_fd_method);
    dup2(fd, STDOUT_FILENO);
    setvbuf(stdout, nullptr, _IOLBF, 0);
}

extern "C" JNIEXPORT void JNICALL
Java_im_mustang_capa_NodeProcess_redirectStderr(JNIEnv* env, jobject thiz, jobject parcelFileDescriptor) {
    if (parcelFileDescriptor == nullptr || g_get_fd_method == nullptr) return;
    int fd = env->CallIntMethod(parcelFileDescriptor, g_get_fd_method);
    dup2(fd, STDERR_FILENO);
    setvbuf(stderr, nullptr, _IONBF, 0);
}

extern "C" JNIEXPORT int JNICALL
Java_im_mustang_capa_NodeProcess_startNode(JNIEnv *env, jobject thiz, jobjectArray args) {
    jsize argc = env->GetArrayLength(args);

    // 1. Calculate total memory needed for all strings
    size_t total_string_size = 0;
    std::vector<jsize> lengths(argc);
    for (jsize i = 0; i < argc; i++) {
        auto arg_jstring = (jstring)env->GetObjectArrayElement(args, i);
        if (arg_jstring == nullptr) {
            lengths[i] = 0;
            continue;
        }
        lengths[i] = env->GetStringUTFLength(arg_jstring);
        total_string_size += lengths[i] + 1; // +1 for null terminator
        env->DeleteLocalRef(arg_jstring);
    }

    // 2. Allocate one contiguous block for strings and one for pointers
    std::vector<char> string_buffer(total_string_size);
    std::vector<char*> argv(argc);

    // 3. Copy strings into the buffer and set pointers
    char* current_pos = string_buffer.data();
    for (jsize i = 0; i < argc; i++) {
        auto arg_jstring = (jstring)env->GetObjectArrayElement(args, i);
        argv[i] = current_pos;

        if (arg_jstring != nullptr) {
            env->GetStringUTFRegion(arg_jstring, 0, lengths[i], current_pos);
            current_pos[lengths[i]] = '\0';
            current_pos += lengths[i] + 1;
            env->DeleteLocalRef(arg_jstring);
        } else {
            *current_pos = '\0';
            current_pos++;
        }
    }

    // 4. Call the node function
    return jint(node::Start(argv.size(), argv.data()));
}
