package im.mustang.capa

import android.content.Context
import com.getcapacitor.Bridge
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException
import java.io.FileOutputStream

class NodeProcess(val context: Context, val coroutineScope: CoroutineScope, val bridge: Bridge) {
    lateinit var job: Job
    lateinit var mainJSPath: String
    val mainJS = "index.mjs"
    val projectDir = "nodejs"
    val cacheDir = context.cacheDir
    val filesDir = context.filesDir
    val assetManager = context.assets


    companion object {
        init {
            System.loadLibrary("node")
            System.loadLibrary("node-process")
        }
    }

    private external fun startNode(args: Array<String>): Int

    fun start() {
        if (this::job.isInitialized && job.isActive) {
            job.cancel()
        }
        job = coroutineScope.launch(Dispatchers.IO) {
            copyAssetDir("public/$projectDir", File(filesDir, projectDir))
            mainJSPath = File(filesDir, "$projectDir/$mainJS").absolutePath
            withContext(Dispatchers.Default) {
                startNode(arrayOf("node", mainJSPath))
            }
        }
    }

    /**
     * Recursively copies a directory from the app's assets to a destination directory.
     *
     * @param assetDir The path of the directory within the assets folder.
     * @param destDir The destination directory where the assets should be copied.
     * @throws IOException If an I/O error occurs during the copy process.
     */
    @Throws(IOException::class)
    private fun copyAssetDir(assetDir: String, destDir: File) {
        // Create the destination directory if it doesn't exist
        if (!destDir.exists()) {
            if (!destDir.mkdirs()) {
                throw IOException("Failed to create destination directory: ${destDir.absolutePath}")
            }
        }

        // List all files and subdirectories in the current asset directory
        val assetFileNames = assetManager.list(assetDir)
            ?: throw IOException("Failed to list assets in directory: $assetDir")

        if (assetFileNames.isEmpty() && assetDir.isNotEmpty()) {
            // It's an empty directory within assets, create it in the destination
            val emptyDir = File(destDir, assetDir)
            if (!emptyDir.exists()) emptyDir.mkdirs()
        }

        for (fileName in assetFileNames) {
            val assetPath = if (assetDir.isEmpty()) fileName else "$assetDir${File.separator}$fileName"
            val destFile = File(destDir, fileName)

            // Check if the current asset is a directory or a file
            // We can determine this by trying to list its contents. If it fails, it's a file.
            try {
                // If list() returns a non-empty array, it's a directory.
                if (assetManager.list(assetPath)?.isNotEmpty() == true) {
                    copyAssetDir(assetPath, destFile) // Recursive call for subdirectory
                } else {
                    // It's a file, copy it
                    assetManager.open(assetPath).use { inputStream ->
                        FileOutputStream(destFile).use { outputStream ->
                            inputStream.copyTo(outputStream)
                        }
                    }
                }
            } catch (e: IOException) {
                // This exception typically means `assetPath` is a file, not a directory.
                // So, we copy it as a file.
                assetManager.open(assetPath).use { inputStream ->
                    FileOutputStream(destFile).use { outputStream ->
                        inputStream.copyTo(outputStream)
                    }
                }
            }
        }
    }
}
