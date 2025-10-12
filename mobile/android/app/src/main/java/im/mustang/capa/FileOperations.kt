package im.mustang.capa

import android.content.res.AssetManager
import com.getcapacitor.Logger
import java.io.BufferedReader
import java.io.File
import java.io.FileOutputStream
import java.io.FileReader
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream

object FileOperations {
    fun existsPath(path: String): Boolean {
        val file = File(path)
        return file.exists()
    }

    fun combinePath(vararg paths: String?): String {
        var file = File(paths[0])

        for (index in 1..<paths.size) {
            file = File(file, paths[index])
        }

        return file.path
    }

    fun combineEnv(vararg variables: String?): String {
        val builder = StringBuilder()

        for (index in variables.indices) {
            val variable: String? = variables[index]

            if (variable == null || variable.isEmpty()) {
                continue
            }

            builder.append(variable)
            if (index < variables.size - 1) {
                builder.append(":")
            }
        }

        return builder.toString()
    }

    @Throws(IOException::class)
    fun readFileFromPath(path: String): String {
        val file = File(path)

        val builder = StringBuilder()
        val reader = BufferedReader(FileReader(file))

        var line: String?
        while ((reader.readLine().also { line = it }) != null) {
            builder.append(line)
            builder.append("\n")
        }

        reader.close()

        return builder.toString()
    }

    fun createDir(dirPath: String): Boolean {
        val directory = File(dirPath)
        if (directory.exists()) return true
        return directory.mkdirs()
    }

    fun deleteDir(dirPath: String): Boolean {
        val directory = File(dirPath)
        return deleteDir(directory)
    }

    fun deleteDir(directory: File): Boolean {
        if (!directory.exists()) return true

        val files = directory.listFiles()
        var success = true

        if (files != null) {
            for (file in files) {
                success = if (file.isDirectory()) {
                    success and deleteDir(file)
                } else {
                    success and file.delete()
                }
            }
        }

        success = success and directory.delete()
        return success
    }

    fun copyAssetDir(
        assetManager: AssetManager,
        assetPath: String,
        destinationPath: String
    ): Boolean {
        try {
            val files = assetManager.list(assetPath)
            if (files == null) return false

            var success = true

            if (files.size == 0) {
                success = copyAsset(assetManager, assetPath, destinationPath)
            } else {
                createDir(destinationPath)

                for (file in files) {
                    success = success and copyAssetDir(
                        assetManager,
                        combinePath(assetPath, file),
                        combinePath(destinationPath, file)
                    )
                }
            }

            return success
        } catch (e: IOException) {
            Logger.error(
                TAG,
                "Failed to copy assets from '$assetPath'.",
                e
            )
            return false
        }
    }

    fun copyAsset(assetManager: AssetManager, assetPath: String, destinationPath: String): Boolean {
        try {
            val destinationFile = File(destinationPath)

            destinationFile.createNewFile()

            val `in` = assetManager.open(assetPath)
            val out: OutputStream = FileOutputStream(destinationPath)

            copyStream(`in`, out)

            `in`.close()
            out.flush()
            out.close()

            return true
        } catch (e: Exception) {
            Logger.error(
                TAG,
                "Failed to copy the asset '$assetPath' to '$destinationPath'.",
                e
            )
            return false
        }
    }

    @Throws(IOException::class)
    fun copyStream(`in`: InputStream, out: OutputStream) {
        val buffer = ByteArray(1024)

        var size: Int
        while ((`in`.read(buffer).also { size = it }) != -1) {
            out.write(buffer, 0, size)
        }
    }
}