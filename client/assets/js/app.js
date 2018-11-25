// Base Url of the API
const baseUrl = "http://jsonplaceholder.typicode.com";

// List component
const List = {
    template: '#list-template',
    data: () => ({
        posts: [],
        search: ""
    }),
    mounted() {
        this.getPosts();
    },
    methods: {
        getPosts() {
            axios.get(baseUrl + `/posts`).then(response => {
                this.posts = response.data
                console.log(this.posts);
            }).catch(error => {
                console.log(error);
            })
        }
    },
    computed: {
        filteredPosts() {
            return this.posts.filter(post => {
                return post.title.includes(this.search);
            })
        }
    }
};

// Post component
const Post = {
    template: '#post-template',
    data: () => ({
        post: null
    }),
    mounted() {
        this.getPosts();
    },
    methods: {
        getPosts() {
            var id = this.$route.params.id;
            axios.get(baseUrl + `/posts/` + id).then(response => {
                this.post = response.data
                console.log(this.post);
            }).catch(error => {
                console.log(error);
            })
        }
    }
};

// Create vue router
var router = new VueRouter({
    mode: 'history',
    routes: [
        {
            name: 'homepage',
            path: '/',
            component: List
        }, {
            name: 'post',
            path: '/:id',
            component: Post
        }
    ]
});

// Create vue instance and mount onto #app
var vue = new Vue({router});
var app = vue.$mount('#app');