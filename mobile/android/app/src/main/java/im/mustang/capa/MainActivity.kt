package im.mustang.capa

import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    private lateinit var nodeJS: NodeJS

    override fun onStart() {
        this.nodeJS = NodeJS(this.applicationContext)
        this.nodeJS.start()
        super.onStart()
    }
}
