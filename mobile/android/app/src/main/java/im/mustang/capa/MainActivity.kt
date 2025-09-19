package im.mustang.capa

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    private lateinit var nodeJS: NodeJS

    override fun onCreate(savedInstanceState: Bundle?) {
        this.nodeJS = NodeJS(this.applicationContext)
        this.nodeJS.start()
        super.onCreate(savedInstanceState)
    }

    override fun onStart() {
        this.nodeJS.start()
        super.onStart()
    }

    override fun onPause() {
        super.onPause()
        this.nodeJS.stop()
    }
}
