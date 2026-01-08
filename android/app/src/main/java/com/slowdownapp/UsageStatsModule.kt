package com.slowdownapp

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.*

class UsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    companion object {
        // Social media package names
        private val SOCIAL_MEDIA_PACKAGES = mapOf(
            "com.instagram.android" to "Instagram",
            "com.twitter.android" to "Twitter",
            "com.zhiliaoapp.musically" to "TikTok",
            "com.ss.android.ugc.trill" to "TikTok",
            "com.facebook.katana" to "Facebook",
            "com.facebook.orca" to "Messenger",
            "com.whatsapp" to "WhatsApp",
            "com.snapchat.android" to "Snapchat",
            "com.google.android.youtube" to "YouTube",
            "org.telegram.messenger" to "Telegram",
            "com.discord" to "Discord",
            "com.reddit.frontpage" to "Reddit",
            "com.linkedin.android" to "LinkedIn",
            "com.pinterest" to "Pinterest",
            "com.tumblr" to "Tumblr"
        )
    }

    @ReactMethod
    fun hasUsageStatsPermission(promise: Promise) {
        try {
            val hasPermission = checkUsageStatsPermission()
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getSocialMediaUsageToday(promise: Promise) {
        try {
            if (!checkUsageStatsPermission()) {
                android.util.Log.e("UsageStatsModule", "Permission denied - no usage stats access")
                promise.reject("PERMISSION_DENIED", "Usage stats permission not granted")
                return
            }

            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            
            val calendar = Calendar.getInstance()
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            calendar.set(Calendar.MILLISECOND, 0)
            val startTime = calendar.timeInMillis
            val endTime = System.currentTimeMillis()

            android.util.Log.d("UsageStatsModule", "Querying usage stats from $startTime to $endTime")

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            val result = WritableNativeMap()
            var totalMinutes = 0L

            android.util.Log.d("UsageStatsModule", "Found ${stats?.size ?: 0} total app stats")

            if (stats != null) {
                for (usageStats in stats) {
                    val packageName = usageStats.packageName
                    if (SOCIAL_MEDIA_PACKAGES.containsKey(packageName)) {
                        val appName = SOCIAL_MEDIA_PACKAGES[packageName] ?: packageName
                        val timeInForeground = usageStats.totalTimeInForeground
                        val minutes = timeInForeground / 60000

                        android.util.Log.d("UsageStatsModule", "📱 $appName ($packageName): ${minutes}min (${timeInForeground}ms)")

                        if (minutes > 0) {
                            val existingMinutes = if (result.hasKey(appName)) result.getInt(appName).toLong() else 0L
                            result.putInt(appName, (existingMinutes + minutes).toInt())
                            totalMinutes += minutes
                        }
                    }
                }
            }

            android.util.Log.d("UsageStatsModule", "✅ Total social media usage: ${totalMinutes}min")

            val response = WritableNativeMap()
            response.putMap("appUsage", result)
            response.putInt("totalMinutes", totalMinutes.toInt())
            
            promise.resolve(response)
        } catch (e: Exception) {
            android.util.Log.e("UsageStatsModule", "Error getting usage stats", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getUsageForPeriod(startTimeMs: Double, endTimeMs: Double, promise: Promise) {
        try {
            if (!checkUsageStatsPermission()) {
                promise.reject("PERMISSION_DENIED", "Usage stats permission not granted")
                return
            }

            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            
            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTimeMs.toLong(),
                endTimeMs.toLong()
            )

            val result = WritableNativeMap()
            var totalMinutes = 0L

            if (stats != null) {
                for (usageStats in stats) {
                    val packageName = usageStats.packageName
                    if (SOCIAL_MEDIA_PACKAGES.containsKey(packageName)) {
                        val appName = SOCIAL_MEDIA_PACKAGES[packageName] ?: packageName
                        val timeInForeground = usageStats.totalTimeInForeground
                        val minutes = timeInForeground / 60000

                        if (minutes > 0) {
                            val existingMinutes = if (result.hasKey(appName)) result.getInt(appName).toLong() else 0L
                            result.putInt(appName, (existingMinutes + minutes).toInt())
                            totalMinutes += minutes
                        }
                    }
                }
            }

            val response = WritableNativeMap()
            response.putMap("appUsage", result)
            response.putInt("totalMinutes", totalMinutes.toInt())
            
            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getAllInstalledSocialMediaApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val installedApps = WritableNativeArray()

            for ((packageName, appName) in SOCIAL_MEDIA_PACKAGES) {
                try {
                    pm.getPackageInfo(packageName, 0)
                    val appInfo = WritableNativeMap()
                    appInfo.putString("packageName", packageName)
                    appInfo.putString("appName", appName)
                    installedApps.pushMap(appInfo)
                } catch (e: PackageManager.NameNotFoundException) {
                    // App not installed
                }
            }

            promise.resolve(installedApps)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    private fun checkUsageStatsPermission(): Boolean {
        val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val time = System.currentTimeMillis()
        val stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 60, time)
        return stats != null && stats.isNotEmpty()
    }
}
