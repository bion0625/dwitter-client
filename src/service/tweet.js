export default class TweetService {

  constructor(http, tokenStorage, socket){
    this.http = http;
    this.tokenStorage = tokenStorage;
    this.socket = socket;
  }
  async getTweets(username) {
    const query = username ? `?username=${username}` : '';
    return this.http.fetch(`/tweets${query}`,{
      method: 'GET',
      headers: this.getHeader(),
    });
  }

  async postTweet(text) {
    return this.http.fetch(`/tweets`,{
      method: 'POST',
      headers: this.getHeader(),
      body: JSON.stringify({text, username: 'ellie', name: 'Ellie'})
    });
  }

  async deleteTweet(tweetId) {
    return this.http.fetch(`/tweets/${tweetId}`,{
      headers: this.getHeader(),
      method: 'DELETE',
    });
  }

  async updateTweet(tweetId, text) {
    return this.http.fetch(`/tweets/${tweetId}`,{
      method: 'PUT',
      headers: this.getHeader(),
      body: JSON.stringify({text})
    });
  }

  getHeader(){
    const token = this.tokenStorage.getToken();
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  onSync(callback){
    return this.socket.onSync('tweets', callback);
  }
}
