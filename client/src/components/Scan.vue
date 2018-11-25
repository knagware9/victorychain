<template>
    <div class="scan">
        <div class="content_element">
            <h1>{{ title }}</h1>
            <p>{{ text }}</p>
        </div>
        <div class="content_element">
            <qrcode-stream :track="false" @decode="onDecode" @init="logErrors" />
            <p class="decode-result">Last result: <b>{{ result }}</b></p>
        </div>
    </div>
</template>

<script>
    import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'
    export default {
        name: 'Scan',
        components: {
            QrcodeStream,
            QrcodeDropZone,
            QrcodeCapture
        },
        data() {
            return {
                title: 'Scan',
                text: 'Scan',
                result: ''
            }
        },
        methods: {
            onDecode (result) {
                this.result = result
            },

            logErrors (promise) {
                promise.catch(console.error)
            }
        }
    }
</script>
