package im.mustang.capa

import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.edit
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONException
import org.json.JSONObject
import java.io.IOException

const val TAG = "NodeJS-Mobile"

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
        this.preferences = context.getSharedPreferences(TAG, Context.MODE_PRIVATE)

        try {
            this.packageInfo =
                context.packageManager.getPackageInfo(context.packageName, 0)
        } catch (e: PackageManager.NameNotFoundException) {
            Log.e(
                TAG,
                "Failed to get the application's package information.",
                e
            )
        }
    }
    private val PREFS_APP_UPDATED_TIME: String = "AppUpdateTime"
    private val projectDir = "nodejs"
    private external fun startNode(args: Array<String>)

    private val nodeScope = CoroutineScope(Dispatchers.IO)
    private var isStarted = false

    fun start() {
        if (isStarted) return

        isStarted = true

        nodeScope.launch(Dispatchers.IO) {
            val filesPath = context.filesDir.absolutePath
            var projectMainPath: String
            val mainFile = "index.mjs"

            val basePath = FileOperations.combinePath(filesPath, "public")
            val projectPath = FileOperations.combinePath(basePath, "nodejs")
            val dataPath = FileOperations.combinePath(basePath, "data")

            val copyNodeProjectSuccess =
                copyNodeProjectFromAPK(projectDir, projectPath)
            if (!copyNodeProjectSuccess) {
                Log.e(TAG, "Unable to copy the Node.js project from APK.")
                cancel()
            }

            if (!FileOperations.existsPath(projectPath)) {
                Log.e(TAG, "Unable to access the Node.js project. (No such directory)")
                cancel()
            }

            val createDataDirSuccess = FileOperations.createDir(dataPath)
            if (!createDataDirSuccess) {
                Log.d(
                    TAG,
                    "Unable to create a directory for persistent data storage."
                )
            }

            val projectPackageJsonPath = FileOperations.combinePath(projectPath, "package.json")

            var projectMainFile = "index.mjs"
            if (mainFile != null && !mainFile.isEmpty()) {
                projectMainFile = mainFile
            } else if (FileOperations.existsPath(projectPackageJsonPath)) {
                try {
                    val projectPackageJsonData =
                        FileOperations.readFileFromPath(projectPackageJsonPath)
                    val projectPackageJson = JSONObject(projectPackageJsonData)
                    val projectPackageJsonMainFile = projectPackageJson.getString("main")

                    if (!projectPackageJsonMainFile.isEmpty()) {
                        projectMainFile = projectPackageJsonMainFile
                    }
                } catch (e: JSONException) {
                    Log.e(TAG, 
                        "Failed to read the package.json file of the Node.js project.",
                        e
                    )
                    cancel()
                } catch (e: IOException) {
                    Log.e(TAG, 
                        "Failed to read the package.json file of the Node.js project.",
                        e
                    )
                    cancel()
                }
            }

            projectMainPath = FileOperations.combinePath(projectPath, projectMainFile)

            if (!FileOperations.existsPath(projectMainPath)) {
                Log.e(TAG, "Unable to access main script of the Node.js project. (No such file) $projectMainPath")
                cancel()
            }

            withContext(Dispatchers.Default) {
                startNode(arrayOf("node", projectMainPath))
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
        projectDir: String?,
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
                preferences.getLong(TAG, 0)
            val lastUpdateTime = packageInfo.lastUpdateTime
            return lastUpdateTime != previousLastUpdateTime
        }

    private fun saveAppUpdateTime() {
        val lastUpdateTime = packageInfo.lastUpdateTime
        preferences.edit {
            putLong(PREFS_APP_UPDATED_TIME, lastUpdateTime)
        }
    }
}