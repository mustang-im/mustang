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


// Use ViewModels so it has the same lifecycle as the activity or App
// <https://developer.android.com/topic/libraries/architecture/viewmodel#lifecycle>
class NodeProcess(val context: Context): ViewModel() {
    private val TAG = "NodeProcess"
    private lateinit var job: Job
    private val mainJS = "index.mjs"
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
                Log.d(TAG, "Starting to load libraries")
                loadLibraries()
                Log.d(TAG, "Libraries loaded")


                // Node.js assets are in the APK archived and cannot be accessed with a path
                // Because the we have node native modules and multiple files, we need to have
                // it copied to a physical location for node to find the .node files using relative paths
                val from = "public/$nodeDir"
                val to = "${filesDir.absoluteFile}/$nodeDir"
                Log.d(TAG, "Copying assets from $from to $to")
                val copyResult = FileOperations.copyAssetsDir(assetManager, from, to)
                Log.d(TAG, "Assets copied: $copyResult")
                if (!copyResult) {
                    throw Exception("Error copying assets")
                }

                val mainJS = File(to, mainJS)
                if (!mainJS.exists()) {
                    throw Exception("Main JS file not found")
                }

                val args = arrayOf("node", mainJS.absolutePath)
                Log.d(TAG, "Starting node with: ${args.joinToString(" ")}")
                startNode(args)
            } catch (e: Exception) {
                Log.e(TAG, "Error starting node", e)
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        if (this::job.isInitialized && job.isActive) {
            Log.d(TAG, "Cancelling job")
            job.cancel()
        }
    }
}