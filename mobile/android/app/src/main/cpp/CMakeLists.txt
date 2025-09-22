# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html

# Sets the minimum version of CMake required to build the native library.

cmake_minimum_required(VERSION 3.4.1)

# Creates and names a library, sets it as either STATIC
# or SHARED, and provides the relative paths to its source code.
# You can define multiple libraries, and CMake builds them for you.
# Gradle automatically packages shared libraries with your APK.

add_library(native-lib
        SHARED
        native-lib.cpp)

include_directories(libnode/include/node/)

add_library(libnode
        SHARED
        IMPORTED)
set_target_properties( # Specifies the target library.
        libnode
        # Specifies the parameter you want to define.
        PROPERTIES IMPORTED_LOCATION
        # Provides the path to the library you want to import.
        ${CMAKE_SOURCE_DIR}/libnode/bin/${ANDROID_ABI}/libnode.so)

find_library(log-lib
        log)

target_link_libraries( # Specifies the target library.
        native-lib
        # Links imported library.
        libnode
        # Links the target library to the log library
        # included in the NDK.
        ${log-lib})
