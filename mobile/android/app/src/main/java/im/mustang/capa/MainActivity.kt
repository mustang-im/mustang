package im.mustang.capa

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : BridgeActivity() {
    private val coroutineScope = CoroutineScope(Dispatchers.IO)
    private lateinit var nodeJS: NodeJS

    override fun onCreate(savedInstanceState: Bundle?) {
        coroutineScope.launch {
            this@MainActivity.nodeJS = NodeJS(this@MainActivity.applicationContext)
            this@MainActivity.nodeJS.start()
        }
        super.onCreate(savedInstanceState)
    }

    override fun onDestroy() {
        this.nodeJS.stop()
        super.onDestroy()
    }
}
