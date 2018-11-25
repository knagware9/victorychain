<template>
    <div class="home">
        <div class="content_element">
            <h1>{{ title }}</h1>
            <p>{{ text }}</p>
            <div class="mod_button"><a style="color: white;" href="#/scan">{{ buttonText }}</a></div>
        </div>
        <div class="content_element">
            <div class="mod_image">
                <img alt="Swiss Army Knife" src="../assets/knife.svg"/>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Home',
        data() {
            return {
                title: 'Produktregistrierung',
                text: 'Bitte registrieren sie hier ihr neues originales Victorinox Messer. So stellen wir mit ihrer Hilfe sicher, dass dieses Qualitätsprodukt schwieriger zu fälschen ist. Ausserdem profitieren sie als VAT-Token Halter von exklusiven Angeboten',
                buttonText: 'QR-Code aufnehmen',
            }
        },
    }
</script>
