import React from 'react';
import $ from 'jquery';
import { Tabs, Button, Spin } from 'antd';
import { GEO_OPTIONS, POS_KEY, API_ROOT, TOKEN_KEY, AUTH_PREFIX } from './constants';
import { Gallery } from './Gallery';

export class Home extends React.Component {

    state = {
        loadingGeoLocation: false,
        loadingPosts: false,
        posts: [],
        error: '',
    }

    componentDidMount() {
        this.setState({ loadingGeoLocation: true, error: '' });
        this.getGeolocation();
    }

    getGeolocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS,
            );
        } else {
            this.setState({ loadingGeoLocation: false, error: 'Your browser does not support geolocation.' });
        }
    }

    onSuccessLoadGeoLocation = (position) => {
        this.setState({ loadingGeoLocation: false, error: '' });
        console.log(position);
        const { latitude, longitude } = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({ lat: latitude, lon: longitude }));
        this.loadNearbyPost();
    }

    loadNearbyPost= () => {
        this.setState({ loadingPosts: true, error: '' });
        const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
        const token = localStorage.getItem(TOKEN_KEY);
        $.ajax({
            url: `${API_ROOT}/search?lat=${lat}&lon=${lon}&range=20000`,
            method: 'GET',
            headers: {
                Authorization: `${AUTH_PREFIX} ${token}`,
            }
        }).then((response) => {
            const posts = response ? response : [];
            this.setState({ posts, loadingPosts: false, error: '' });
            console.log(response);
        }, (response) => {
            console.log(response.responseText);
            this.setState({ loadingPosts: false, error: 'Failed to load posts.' });
        }).catch((e) => {
            console.log(e);
        });
    }

    onFailedLoadGeoLocation = () => {
        console.log('failed to load geo location.');
        this.setState({ loadingGeoLocation: false, error: 'Failed to load geo location.' });
    }

    getResult = () => {
        if (this.state.error) {
            return <div>{this.state.error}</div>;
        } else if (this.state.loadingGeoLocation) {
            return <Spin tip="Loading geo location..."/>;
        } else if (this.state.loadingPosts) {
            return <Spin tip="Loading posts..."/>;
        } else if (this.state.posts) {
            const images = this.state.posts.map((post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    caption: post.message,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                };
            });
            return <Gallery images={images}/>;
        } else {
            return <div>Content of tab 1</div>;
        }
    }

    render() {
        const TabPane = Tabs.TabPane;
        const operations = <Button type="primary">Create New Post</Button>;
        return (
            <Tabs tabBarExtraContent={operations} className="main-tabs">
                <TabPane tab="Image Posts" key="1">
                    {this.getResult()}
                </TabPane>
                <TabPane tab="Video Posts" key="2">Content of tab 2</TabPane>
                <TabPane tab="Map" key="3">Content of tab 3</TabPane>
            </Tabs>
        );
    }
}
