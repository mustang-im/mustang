package im.mustang.capa

import android.os.Bundle
import androidx.lifecycle.lifecycleScope
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    val nodeProcess = NodeProcess(applicationContext, lifecycleScope)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        nodeProcess.start("nodejs", arrayOf("node", "index.mjs"))
    }
}
