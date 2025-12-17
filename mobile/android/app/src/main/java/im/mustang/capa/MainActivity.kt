package im.mustang.capa

import android.os.Bundle
import androidx.lifecycle.lifecycleScope
import com.getcapacitor.BridgeActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : BridgeActivity() {
    lateinit var nodeProcess: NodeProcess

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycleScope.launch(Dispatchers.IO) {
            nodeProcess = NodeProcess(applicationContext, lifecycleScope, bridge)
            nodeProcess.start()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        lifecycleScope.launch(Dispatchers.IO) {
            nodeProcess.stop()
        }
    }
}
