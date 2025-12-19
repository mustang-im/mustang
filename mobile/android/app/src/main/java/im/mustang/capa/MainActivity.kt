package im.mustang.capa

import android.os.Bundle
import androidx.activity.viewModels
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    val nodeProcess: NodeProcess by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(Logger::class.java)
        super.onCreate(savedInstanceState)
        nodeProcess.start(applicationContext)
    }
}
