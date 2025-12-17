package im.mustang.capa

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "Logger")
class Logger : Plugin() {

    // This method is called by Capacitor when the plugin is loaded.
    // It's the perfect place to initialize.
    override fun load() {
        super.load()
        // Save the initialized instance of this plugin to the companion object.
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
        notifyListeners("capLog", logJS)
    }
    private fun error(error: String) {
        val errorJS = JSObject()
        errorJS.put("error", error)
        notifyListeners("capError", errorJS)
    }
}
