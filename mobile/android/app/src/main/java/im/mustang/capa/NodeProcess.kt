package im.mustang.capa

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageInfo
import android.content.res.AssetManager
import android.os.ParcelFileDescriptor
import androidx.core.content.edit
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

// Use application context to avoid memory leaks. Holding a direct context is risky.
@SuppressLint("StaticFieldLeak")
class NodeProcess(): ViewModel() {
    private lateinit var job: Job
    private val mainJS = "index.mjs"
    private val projectDir = "nodejs"
    private val APP_UPDATE_TIME = "app_update_time"
    private val PREFS_TAG = "node_process_prefs"

    // This scope is for the I/O reading threads. SupervisorJob prevents one failure from killing the other.
    private val loggerScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private var isInitialized = false
    private var appContext: Context? = null
    private var stdoutPipe: ParcelFileDescriptor? = null
    private var stderrPipe: ParcelFileDescriptor? = null

    // --- Lazy properties for performance: initialized only once on first access ---
    private val preferences: SharedPreferences by lazy {
        appContext!!.getSharedPreferences(PREFS_TAG, Context.MODE_PRIVATE)
    }
    private val packageInfo: PackageInfo by lazy {
        appContext!!.packageManager.getPackageInfo(appContext!!.packageName, 0)
    }
    private val filesDir: File by lazy { appContext!!.filesDir }
    private val assets: AssetManager by lazy { appContext!!.assets }
    private val mainJSPath: String by lazy { File(filesDir, "$projectDir/$mainJS").absolutePath }

    private companion object {
        init {
            System.loadLibrary("node")
            System.loadLibrary("node-process")
        }
    }


    private external fun redirectStdout(writeFd: ParcelFileDescriptor?)
    private external fun redirectStderr(writeFd: ParcelFileDescriptor?)
    private external fun startNode(args: Array<String>): Int

    fun start(context: Context) {
        // Prevent re-initialization
        if (isInitialized) {
            return
        }
        this.appContext = context.applicationContext
        isInitialized = true

        job = viewModelScope.launch(Dispatchers.IO) {
            try {
                // Check for updates and copy assets if needed
                if (!isAppUpdated()) {
                    saveAppUpdatedTime()
                    val projectDestDir = File(filesDir, projectDir)
                    if (projectDestDir.exists()) {
                        deleteDirectory(projectDestDir)
                    }
                    copyAssetDir("public/$projectDir", projectDestDir, assets)
                }

                // Start log redirection before starting the node process
                startRedirectingStdout()
                startRedirectingStderr()

                // This is a long-running, blocking call.
                startNode(arrayOf("node", "--optimize-for-size", "--max-old-space-size=256", mainJSPath))

            } catch (e: Exception) {
                // Catch any crash during setup or execution.
                // This prevents the whole app from crashing if Node.js fails.
                Logger.error("Node.js process failed or exited: ${e.message}")
            } finally {
                Logger.log("Node.js process has finished.")
            }
        }
    }

    // A single, efficient, reusable pipe reader
    private fun startReadingFromPipe(readFd: ParcelFileDescriptor, logAction: (String) -> Unit) {
        loggerScope.launch {
            try {
                ParcelFileDescriptor.AutoCloseInputStream(readFd).use { inputStream ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    while (isActive) {
                        bytesRead = inputStream.read(buffer)
                        if (bytesRead == -1) {
                            break
                        }

                        if (bytesRead > 0) {
                            val message = String(buffer, 0, bytesRead, Charsets.UTF_8)
                            logAction(message)
                        }
                    }
                }
            } catch (e: IOException) {
                // This is expected when the pipe is closed by the dying node process
                Logger.error("Pipe reader finished: ${e.message}")
            }
        }
    }

    private fun startRedirectingStdout() {
        if (stdoutPipe != null) return
        try {
            val (readFd, writeFd) = ParcelFileDescriptor.createPipe()
            stdoutPipe = readFd
            redirectStdout(writeFd)
            writeFd.close()
            startReadingFromPipe(readFd, Logger::log)
        } catch (e: IOException) {
            Logger.error("Failed to start stdout redirection ${e.message}")
        }
    }

    private fun startRedirectingStderr() {
        if (stderrPipe != null) return
        try {
            val (readFd, writeFd) = ParcelFileDescriptor.createPipe()
            stderrPipe = readFd
            redirectStderr(writeFd)
            writeFd.close()
            startReadingFromPipe(readFd, Logger::error)
        } catch (e: IOException) {
            Logger.error("Failed to start stderr redirection ${e.message}")
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
    private fun isAppUpdated(): Boolean {
        val previousLastUpdateTime = preferences.getLong(APP_UPDATE_TIME, 0)
        return packageInfo.lastUpdateTime == previousLastUpdateTime
    }

    private fun saveAppUpdatedTime() {
        preferences.edit {
            putLong(APP_UPDATE_TIME, packageInfo.lastUpdateTime)
        }
    }

    override fun onCleared() {
        super.onCleared()
        // Clean up resources when the ViewModel is destroyed
        try {
            stdoutPipe?.close()
            stderrPipe?.close()
            job.cancel() // Ensure the main coroutine is stopped
        } catch (e: IOException) {
            // Ignore, pipes might already be closed
        }
    }
}
