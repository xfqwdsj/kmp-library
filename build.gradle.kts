plugins {
    alias(libs.plugins.kotlinMultiplatform) apply false
    alias(libs.plugins.spotless)
}

spotless {
    kotlinGradle {
        ktfmt().kotlinlangStyle()
    }
}
