<template>
    <div class="home">
        <div v-if="showHome === true">
            <div class="content_element">
                <h1>{{ homwTitle }}</h1>
                <p>{{ homeText }}</p>
                <div class="mod_button" v-on:click="[showHome = false, showScan = true]">{{ homeButtonText }}</div>
            </div>
            <div class="content_element">
                <div class="mod_image">
                    <img alt="Swiss Army Knife" src="../assets/knife.svg"/>
                </div>
            </div>
        </div>
        <div v-if="showScan === true">
            <div class="content_element">
                <h1>{{ scanTitle }}</h1>
            </div>
            <div class="content_element">
                <qrcode-stream :track="false" @decode="onDecode" @init="logErrors"/>
                <p class="decode-result">Last result: <b>{{ scanResult }}</b></p>
            </div>
        </div>
        <div v-if="showCreate === true">
            <div class="mod_title">
                <h1>{{ createTitle }}</h1>
            </div>
            <div class="content_element">
                <div class="mod_table">
                    <div class="table_title">
                        <h2>{{ createText }}</h2>
                    </div>
                    <div class="table_row">
                        <div class="table_column">Model: </div>
                        <div class="table_column">{{ scanResult.model }}</div>
                    </div>
                    <div class="table_row">
                        <div class="table_column">Shell material: </div>
                        <div class="table_column">{{ scanResult.shellMaterial }}</div>
                    </div>
                    <div class="table_row">
                        <div class="table_column">Size: </div>
                        <div class="table_column">{{ scanResult.size }}</div>
                    </div>
                </div>
            </div>
            <div class="content_element">
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
                            <div class="mod_button" v-on:click="this.registerProduct">register</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showCreated === true">
            <div class="mod_title">
                <h1>{{homwTitle}}</h1>
            </div>
            <div class="content_element">
                <div class="mod_success">
                    Product has been registered
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {QrcodeStream, QrcodeDropZone, QrcodeCapture} from 'vue-qrcode-reader';
    import axios from 'axios';

    export default {
        name: 'Home',
        components: {
            QrcodeStream,
            QrcodeDropZone,
            QrcodeCapture
        },
        data() {
            return {
                homwTitle: 'Product registration',
                homeText: 'Please register your new original Victorinox knife here. This will help us to ensure that this quality product is more difficult to counterfeit. As a key holder you will also benefit from exclusive offers.',
                homeButtonText: 'Scan QR code',
                scanTitle: 'Scan QR-Code',
                scanResult: '',
                createTitle: 'Product registration',
                createText: 'Product details',
                createButtonText: 'Register',
                showHome: true,
                showScan: false,
                showCreate: false,
                showCreated: false
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
                    this.showCreate = true;
                }
            },

            logErrors(promise) {
                promise.catch(console.error)
            },

            registerProduct() {
                let postBody = {
                    ownerEmail: this.scanResult.owner.email,
                    ownerFirstName: this.scanResult.owner.firstName,
                    ownerLastName: this.scanResult.owner.lastName,
                    ownerLanguage: this.scanResult.owner.language,
                    ownerCountry: this.scanResult.owner.country,
                    ownerGender: this.scanResult.owner.gender,
                    productModel: this.scanResult.model,
                    productShellMaterial: this.scanResult.shellMaterial,
                    productSize: this.scanResult.size,
                    productSerialNumber: this.scanResult.serialNumber
                };

                let that = this;

                axios({
                    method: 'post',
                    url: 'http://localhost:8080/create',
                    data: postBody,
                    config: { headers: {'Content-Type': 'application/x-www-form-urlencoded' }}
                })
                    .then(function (response) {
                        if (response.data === 'Product created successfully!') {
                            that.showCreate = false;
                            that.showCreated = true;
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    });
            }
        }
    }
</script>
