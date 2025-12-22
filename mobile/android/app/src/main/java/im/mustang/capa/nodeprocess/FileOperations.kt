package im.mustang.capa.nodeprocess

import android.content.res.AssetManager
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

object FileOperations {
    private const val TAG = "FileOperations"

    // Asynchronous copying
    suspend fun copyAssetsDir(assetManager: AssetManager, from: String, to: String): Boolean = coroutineScope {
        try {
            // Get the list of files in the assets directory
            // if there's no files return
            val files = assetManager.list(from)
            val copyResults = ArrayList<Boolean>()

            if (files == null) {
                Log.e(TAG, "Error listing assets directory: $from")
                return@coroutineScope false
            }

            if (files.isEmpty()) {
                //If it's a file, it won't have any assets "inside" it.
                copyResults.add(copyAssetFile(assetManager, from, to))
            } else {
                File(to).mkdirs()
                // Copy files in parallel
                val results = files.map { file ->
                    async {
                        val inputPath = "$from/$file"
                        val outputPath = "$to/$file"
                        // There may be nested directories
                        val result = copyAssetsDir(assetManager, inputPath, outputPath)
                        copyResults.add(result)
                    }
                }
                // Wait for all copies to finish
                results.awaitAll()
            }

            // Fail if any copy failed
            if (copyResults.any { !it }) {
                throw Exception("Error copying assets")
            }
            // Regular returns don't work in coroutines
            return@coroutineScope true
        } catch (e: Exception) {
            Log.e(TAG, "Error copying asset directory: $from", e)
            return@coroutineScope false
        }
    }

    // Copy files with IO coroutine context to prevent blocking
    suspend fun copyAssetFile(assetManager: AssetManager, from: String, to: String) = withContext(Dispatchers.IO) {
        try {
            val inputStream = assetManager.open(from)
            File(to).createNewFile()
            val outputStream = FileOutputStream(to)
            inputStream.copyTo(outputStream)
            inputStream.close()
            outputStream.flush()
            outputStream.close()
            // Regular returns don't work in coroutines
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "Error copying asset file: $from", e)
            return@withContext false
        }
    }
}
