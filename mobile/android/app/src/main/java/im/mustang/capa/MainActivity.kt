package im.mustang.capa

import androidx.activity.viewModels
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    val nodeProcess: NodeProcess by viewModels()

    override fun onStart() {
        super.onStart()
        nodeProcess.start(applicationContext)
    }
}
