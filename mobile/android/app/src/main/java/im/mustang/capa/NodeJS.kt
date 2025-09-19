package im.mustang.capa

import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.edit
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext


object Constants {
    const val TAG = "NodeJS-Mobile"
    const val PREFS_APP_UPDATED_TIME = "AppUpdateTime"
    const val PROJECT_DIR = "nodejs"
    const val PROJECT_MAIN_FILE = "index.mjs"
}

class NodeJS {
    companion object {
        init {
            System.loadLibrary("native-lib")
            System.loadLibrary("node")
        }
    }
    private val context: Context
    private val preferences: SharedPreferences
    private lateinit var packageInfo: PackageInfo

    constructor(context: Context) {
        this.context = context
        this.preferences = context.getSharedPreferences(Constants.TAG, Context.MODE_PRIVATE)

        try {
            this.packageInfo =
                context.packageManager.getPackageInfo(context.packageName, 0)
        } catch (e: PackageManager.NameNotFoundException) {
            Log.e(
                Constants.TAG,
                "Failed to get the application's package information.",
                e
            )
        }
    }
    private external fun startNode(args: Array<String>)

    private val nodeScope = CoroutineScope(Dispatchers.IO)

    private var isStarted = false

    fun start() {
        if (isStarted) return

        isStarted = true

        nodeScope.launch {
            val filesPath = context.filesDir.absolutePath

            val basePath = FileOperations.combinePath(filesPath, "public")
            val projectPath = FileOperations.combinePath(basePath, "nodejs")

            val copyNodeProjectSuccess =
                copyNodeProjectFromAPK(Constants.PROJECT_DIR, projectPath)
            if (!copyNodeProjectSuccess) {
                Log.e(Constants.TAG, "Unable to copy the Node.js project from APK.")
                cancel()
            }

            if (!FileOperations.existsPath(projectPath)) {
                Log.e(Constants.TAG, "Unable to access the Node.js project. (No such directory)")
                cancel()
            }

            val projectMainPath = FileOperations.combinePath(projectPath, Constants.PROJECT_MAIN_FILE)

            if (!FileOperations.existsPath(projectMainPath)) {
                Log.e(Constants.TAG, "Unable to access main script of the Node.js project. (No such file) $projectMainPath")
                cancel()
            }

            withContext(Dispatchers.Default) {
                try {
                    startNode(arrayOf("node", projectMainPath))
                } catch (e: Throwable) {
                    Log.e(Constants.TAG, "Error starting Node.js", e)
                }
            }
        }
    }

    private external fun stopNode()
    fun stop() {
        if (!isStarted) return
        stopNode()
        nodeScope.cancel()
        isStarted = false
    }

    private fun copyNodeProjectFromAPK(
        projectDir: String,
        projectPath: String,
    ): Boolean {
        val nodeAssetDir = FileOperations.combinePath("public", projectDir)
        val assetManager = context.assets

        var success = true
        if (FileOperations.existsPath(projectPath) && this.isAppUpdated) {
            success = FileOperations.deleteDir(projectPath)
        }
        success = success and FileOperations.copyAssetDir(assetManager, nodeAssetDir, projectPath)

        saveAppUpdateTime()
        return success
    }
    private val isAppUpdated: Boolean
        get() {
            val previousLastUpdateTime =
                preferences.getLong(Constants.TAG, 0)
            val lastUpdateTime = packageInfo.lastUpdateTime
            return lastUpdateTime != previousLastUpdateTime
        }

    private fun saveAppUpdateTime() {
        val lastUpdateTime = packageInfo.lastUpdateTime
        preferences.edit {
            putLong(Constants.PREFS_APP_UPDATED_TIME, lastUpdateTime)
        }
    }
}