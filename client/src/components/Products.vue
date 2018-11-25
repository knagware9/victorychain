<template>
    <div class="products">
        <div class="content_element">
            <h1>{{ title }}</h1>
        </div>
        <div class="content_element">
            <ul v-for="item in products">
                <li>
                    {{ item }}
                    <div class="mod_button" v-on:click="showScan = true">change owner</div>
                </li>
            </ul>
        </div>

        <div v-if="showScan === true">
            <div class="content_element">
                <h1>Scan QR-Code</h1>
            </div>
            <div class="content_element">
                <qrcode-stream :track="false" @decode="onDecode" @init="logErrors"/>
                <p class="decode-result">Last result: <b>{{ scanResult }}</b></p>
            </div>
        </div>

        <div class="content_element" v-if="showForm === true">
            <div class="mod_table">
                <div class="table_title">
                    <h2>Owner</h2>
                </div>
                <div class="table_row">
                    <div class="table_column">Gender:</div>
                    <div class="table_column">
                        <select v-model="scanResult.owner.gender">
                            <option value="MALE">MALE</option>
                            <option value="MALE">FEMALE</option>
                        </select>
                    </div>
                </div>
                <div class="table_row">
                    <div class="table_column">First name:</div>
                    <div class="table_column">
                        <input v-model="scanResult.owner.firstName" placeholder="edit me">
                    </div>
                </div>
                <div class="table_row">
                    <div class="table_column">Last name:</div>
                    <div class="table_column">
                        <input v-model="scanResult.owner.lastName" placeholder="edit me">
                    </div>
                </div>
                <div class="table_row">
                    <div class="table_column">Country:</div>
                    <div class="table_column">
                        <input v-model="scanResult.owner.country" placeholder="edit me">
                    </div>
                </div>
                <div class="table_row">
                    <div class="table_column">Language:</div>
                    <div class="table_column">
                        <input v-model="scanResult.owner.language" placeholder="edit me">
                    </div>
                </div>
                <div class="table_row">
                    <div class="table_column">Email:</div>
                    <div class="table_column">
                        <input v-model="scanResult.owner.email" placeholder="edit me">
                    </div>
                </div>
                <div class="table_row">
                    <div class="table_column">
                        <div class="mod_button" v-on:click="this.changeOwner">Change</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {QrcodeStream, QrcodeDropZone, QrcodeCapture} from 'vue-qrcode-reader';
    import axios from 'axios';
    export default {
        name: 'Products',
        components: {
            QrcodeStream,
            QrcodeDropZone,
            QrcodeCapture
        },
        data() {
            return {
                title: 'Products',
                products: [],
                showForm: false,
                scanResult: '',
                showScan: false,
            }
        },
        methods: {
            onDecode(result) {
                this.scanResult = result;
                if (this.scanResult !== '') {
                    this.scanResult = JSON.parse(this.scanResult);

                    this.scanResult.owner = {
                        gender: '',
                        firstName: '',
                        lastName: '',
                        country: '',
                        language: '',
                        email: ''
                    };
                    this.showScan = false;
                    this.showForm = true;
                }
            },

            logErrors(promise) {
                promise.catch(console.error)
            },
            getAllProducts() {
                let that = this;
                axios({
                    method: 'get',
                    url: 'http://localhost:8080/products'
                })
                    .then(function (response) {
                        response.data.forEach((product) => {
                            that.products.push(product.Record);
                        });
                    })
                    .catch(e => {
                        console.log(e);
                    });
            },
            changeOwner() {
                let postBody = {
                    ownerEmail: this.scanResult.owner.email,
                    ownerFirstName: this.scanResult.owner.firstName,
                    ownerLastName: this.scanResult.owner.lastName,
                    ownerLanguage: this.scanResult.owner.language,
                    ownerCountry: this.scanResult.owner.country,
                    ownerGender: this.scanResult.owner.gender,
                    productSerialNumber: this.scanResult.serialNumber
                };

                let that = this;

                axios({
                    method: 'post',
                    url: 'http://localhost:8080/change-owner',
                    data: postBody,
                    config: { headers: {'Content-Type': 'application/x-www-form-urlencoded' }}
                })
                    .then(function (response) {
                        if (response.data === 'Product created successfully!') {
                            that.showForm = false;
                            that.showScan = false;
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    });
            },
        },
        beforeMount(){
            this.getAllProducts()
        },
    }
</script>
