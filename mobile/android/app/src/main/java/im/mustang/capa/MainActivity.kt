package im.mustang.capa

import androidx.lifecycle.lifecycleScope
import com.getcapacitor.BridgeActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : BridgeActivity() {
    lateinit var nodeProcess: NodeProcess

    override fun onStart() {
        super.onStart()
        lifecycleScope.launch(Dispatchers.IO) {
            nodeProcess = NodeProcess(applicationContext, lifecycleScope)
            nodeProcess.start()
        }
    }
}
