package im.mustang.capa

import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageInfo
import android.content.res.AssetManager
import android.os.ParcelFileDescriptor
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.io.File
import java.io.IOException
import java.io.FileOutputStream
import androidx.core.content.edit
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.isActive

class NodeProcess(): ViewModel() {
    private lateinit var job: Job
    private lateinit var mainJSPath: String
    private val mainJS = "index.mjs"
    private val projectDir = "nodejs"
    private val APP_UPDATE_TIME = "app_update_time"
    private val PREFS_TAG = "node_process_prefs"
    private val loggerScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var stdoutPipe: ParcelFileDescriptor? = null
    private var stderrPipe: ParcelFileDescriptor? = null

    private companion object {
        init {
            System.loadLibrary("node")
            System.loadLibrary("node-process")
        }
    }

    private external fun redirectStdout(writeFd: ParcelFileDescriptor?)
    private external fun redirectStderr(writeFd: ParcelFileDescriptor?)

    private fun startRedirectingStdout() {
        if (stdoutPipe != null) return
        try {
            val pipeFds = ParcelFileDescriptor.createPipe()
            val readFd = pipeFds[0]
            val writeFd = pipeFds[1]
            stdoutPipe = readFd

            // Pass the write-end to the specific native method for stdout
            redirectStdout(writeFd)
            writeFd.close()

            // Launch a dedicated reader for stdout
            loggerScope.launch {
                ParcelFileDescriptor.AutoCloseInputStream(readFd).use { inputStream ->
                    val buffer = ByteArray(4096)
                    var bytesRead: Int
                    while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                        if (bytesRead > 0) {
                            val message = String(buffer, 0, bytesRead, Charsets.UTF_8)
                            Logger.consoleLog(message)
                        }
                    }
                }
            }
        } catch (e: IOException) {
            Log.e("NodeProcess", "Failed to start stdout redirection", e)
        }
    }

    private fun startRedirectingStderr() {
        if (stderrPipe != null) return
        try {
            val pipeFds = ParcelFileDescriptor.createPipe()
            val readFd = pipeFds[0]
            val writeFd = pipeFds[1]
            stderrPipe = readFd

            // Pass the write-end to the specific native method for stderr
            redirectStderr(writeFd)
            writeFd.close()

            // Launch a dedicated reader for stderr
            loggerScope.launch {
                ParcelFileDescriptor.AutoCloseInputStream(readFd).use { inputStream ->
                    val buffer = ByteArray(4096)
                    var bytesRead: Int
                    while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                        if (bytesRead > 0) {
                            val message = String(buffer, 0, bytesRead, Charsets.UTF_8)
                            Logger.consoleError(message)
                        }
                    }
                }
            }
        } catch (e: IOException) {
            Log.e("NodeProcess", "Failed to start stderr redirection", e)
        }
    }

    private external fun startNode(args: Array<String>): Int

    fun start(context: Context) {
        if (this::job.isInitialized && job.isActive) {
            job.cancel()
        }
        job = viewModelScope.launch(Dispatchers.IO) {
            val filesDir = context.filesDir
            val preferences = context.getSharedPreferences(PREFS_TAG, Context.MODE_PRIVATE)
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            if (!isAppUpdated(preferences, packageInfo)) {
                saveAppUpdatedTime(preferences, packageInfo)
                val projectDestDir = File(filesDir, projectDir)
                if (projectDestDir.exists()) {
                    deleteDirectory(projectDestDir)
                }
                copyAssetDir("public/$projectDir", projectDestDir, context.assets)
            }
            mainJSPath = File(filesDir, "$projectDir/$mainJS").absolutePath
            startRedirectingStdout()
            startRedirectingStderr()
            try {
                startNode(arrayOf("node", mainJSPath))
            } catch (e: Exception) {
                Log.e("NodeProcess", "Failed to start node", e)
                Logger.consoleError("Failed to start node: ${e.message}")
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
    private fun copyAssetDir(assetDir: String, destDir: File, assetManager: AssetManager) {
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
                    copyAssetDir(assetPath, destFile, assetManager) // Recursive call for subdirectory
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
    private fun deleteDirectory(directory: File): Boolean {
        if (directory.exists()) {
            directory.listFiles()?.forEach { file ->
                if (file.isDirectory) {
                    deleteDirectory(file)
                } else {
                    file.delete()
                }}
        }
        return directory.delete()
    }
    fun isAppUpdated(preferences: SharedPreferences, packageInfo: PackageInfo): Boolean {
        val previousLastUpdateTime = preferences.getLong(APP_UPDATE_TIME, 0)
        val lastUpdateTime = packageInfo.lastUpdateTime
        return lastUpdateTime == previousLastUpdateTime
    }
    fun saveAppUpdatedTime(preferences: SharedPreferences, packageInfo: PackageInfo) {
        preferences.edit {
            putLong(APP_UPDATE_TIME, packageInfo.lastUpdateTime)
        }
    }
}
