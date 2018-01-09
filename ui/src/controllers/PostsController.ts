import Vue from 'vue'
import { Route } from 'vue-router'
import DotvueComponent from '../dotvue/DotvueComponent'
import Post from '../models/Post'
import PostRepository from '../repositories/PostsRepository'
import ListTemplate from '../views/posts/list.html'
import ViewTemplate from '../views/posts/view.html'
import PostList from '../components/post-list/PostList'

@DotvueComponent(module, {
    template: ListTemplate,
    components: { 'post-list': PostList }
})
export class List extends Vue {

    public posts = new Array<Post>();

    public static async loadDataAsyncStatic(to: Route) {
        return await PostRepository.all()
    }
    public loadDataAsync(to: Route){
        return List.loadDataAsyncStatic(to);
    }

    public static data: Post[]
    public async beforeRouteEnter(to: Route, from: Route, next: any){
        List.data = Post.convertAll(await List.loadDataAsyncStatic(to))
        next()
    }
    
    public created(){
        this.posts = List.data
    }
}

@DotvueComponent(module, {
    template: ViewTemplate
})
export class View extends Vue {

    public post: Post

    public static async loadDataAsyncStatic(to: Route) {
        return await PostRepository.one(Number(to.params.id))
    }
    public loadDataAsync(to: Route){
        return View.loadDataAsyncStatic(to);
    }

    public static data: Post
    public async beforeRouteEnter(to: Route, from: Route, next: any){
        View.data = new Post(await View.loadDataAsyncStatic(to))
        next()
    }

    public async beforeRouteUpdate(to: Route, from: Route, next: any){
        this.post = new Post(await View.loadDataAsyncStatic(to))
        next()
    }

    public created() {
        this.post = View.data
    }
}
