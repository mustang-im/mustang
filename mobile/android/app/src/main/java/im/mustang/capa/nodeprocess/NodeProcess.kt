package im.mustang.capa.nodeprocess

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext


class NodeProcess: ViewModel() {
    companion object {
        private const val TAG = "NodeProcess"
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
}