package im.mustang.capa

import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "Logger")
class Logger : Plugin() {
    override fun load() {
        super.load()
        instance = this
    }

    companion object {
        val TAG = "Logger"
        private var instance: Logger? = null

        fun log(log: String) {
            Log.d(TAG, log)
            if (instance == null) return
            instance?.consoleLog(log)
        }

        fun error(error: String) {
            Log.e(TAG, error)
            if (instance == null) return
            instance?.consoleError(error)
        }
    }

    private fun consoleLog(log: String) {
        val logJS = JSObject()
        logJS.put("log", log)
        notifyListeners("nativeLog", logJS)
    }

    private fun consoleError(error: String) {
        val errorJS = JSObject()
        errorJS.put("error", error)
        notifyListeners("nativeError", errorJS)
    }
}
