package im.mustang.capa

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin
object Logger: Plugin() {
    fun consoleLog(log: String) {
        val logJS = JSObject()
        logJS.put("log", log)
        notifyListeners("capLog", logJS)
    }
    fun consoleError(error: String) {
        val errorJS = JSObject()
        errorJS.put("error", error)
        notifyListeners("capError", errorJS)
    }
}
