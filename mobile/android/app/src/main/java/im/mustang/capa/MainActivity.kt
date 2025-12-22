package im.mustang.capa

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import im.mustang.capa.nodeprocess.NodeProcess

class MainActivity : BridgeActivity() {
    private lateinit var nodeProcess: NodeProcess
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        nodeProcess = NodeProcess(applicationContext)
        nodeProcess.start()
    }
}
