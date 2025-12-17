package im.mustang.capa

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
        private var instance: Logger? = null

        fun consoleLog(log: String) {
            instance?.log(log)
        }

        fun consoleError(error: String) {
            instance?.error(error);
        }
    }

    private fun log(log: String) {
        val logJS = JSObject()
        logJS.put("log", log)
        notifyListeners("nodeLog", logJS)
    }

    private fun error(error: String) {
        val errorJS = JSObject()
        errorJS.put("error", error)
        notifyListeners("nodeError", errorJS)
    }
}
