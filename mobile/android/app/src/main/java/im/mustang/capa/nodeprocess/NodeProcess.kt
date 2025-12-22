package im.mustang.capa.nodeprocess

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import android.content.res.AssetManager
import android.util.Log
import java.io.File


class NodeProcess(val context: Context): ViewModel() {
    private val TAG = "NodeProcess"
    private lateinit var job: Job
    private val MainJS = "index.mjs"
    private val nodeDir = "nodejs"
    // Don't initialize until needed
    private val assetManager: AssetManager by lazy {
        context.assets
    }
    private val filesDir: File by lazy {
        context.filesDir
    }

    companion object {
        private var librariesLoaded = false
    }

    suspend fun loadLibraries() {
        if (librariesLoaded) return
        withContext(Dispatchers.IO) {
            System.loadLibrary("node-process")
            System.loadLibrary("node")
            librariesLoaded = true
        }
    }

    private external fun startNode(args: Array<String>): Int

    fun start() {
        if (this::job.isInitialized && job.isActive) return
        job = viewModelScope.launch(Dispatchers.IO) {
            try {
                loadLibraries()
                val from = "${filesDir.absoluteFile}/public/$nodeDir"
                val to = "${filesDir.absoluteFile}/$nodeDir"
                val copyResult = FileOperations.copyAssetsDir(assetManager, from, to)
                if (!copyResult) {
                    throw Exception("Error copying assets")
                }
                val mainJS = File(to, MainJS)
                startNode(arrayOf("node", mainJS.absolutePath))
            } catch (e: Exception) {
                Log.e(TAG, "Error starting node", e)
            }
        }
    }
}