import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {

  // categories = [
  //   { name: 'Breakfast', image: 'https://source.unsplash.com/80x80/?breakfast' },
  //   { name: 'Salad', image: 'https://source.unsplash.com/80x80/?salad' },
  //   { name: 'Pizza', image: 'https://source.unsplash.com/80x80/?pizza' },
  //   { name: 'South Indian', image: 'https://source.unsplash.com/80x80/?idli,dosa' },
  // ];

  // restaurants = [
  //   {
  //     name: 'Park Noodles',
  //     cuisine: 'Chinese, Fried Rice',
  //     time: '30-45 mins',
  //     rating: '4.6',
  //     image: 'https://source.unsplash.com/300x150/?noodles'
  //   },
  //   {
  //     name: 'Green Feast',
  //     cuisine: 'Salad, Vegan',
  //     time: '25-30 mins',
  //     rating: '4.3',
  //     image: 'https://source.unsplash.com/300x150/?salad'
  //   },
  // ];

  categories = [
    { name: 'Breakfast', image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?cs=srgb&dl=pexels-willpicturethis-2641886.jpg&fm=jpg' },
    { name: 'Salad', image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?cs=srgb&dl=pexels-willpicturethis-2641886.jpg&fm=jpg' },
    { name: 'Pizza', image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?cs=srgb&dl=pexels-willpicturethis-2641886.jpg&fm=jpg' },
    { name: 'Burger', image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?cs=srgb&dl=pexels-willpicturethis-2641886.jpg&fm=jpg' }
  ];

  restaurants = [
    {
      name: 'Park Noodles',
      desc: 'Chinese, Fried Rice, Noodles',
      discount: '34%',
      time: '30-45',
      rating: 4.6,
      image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?cs=srgb&dl=pexels-willpicturethis-2641886.jpg&fm=jpg'
    },
    {
      name: 'Tandoori Delight',
      desc: 'Tandoori, Indian',
      discount: '25%',
      time: '20-30',
      rating: 4.2,
      image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?cs=srgb&dl=pexels-willpicturethis-2641886.jpg&fm=jpg'
    }
  ];

  constructor(
    public router: Router
  ) { }


  goToProfile(){
    this.router.navigate([('/dashboard/profile/profile-info')])
  }

  goToVegList(){
    this.router.navigate([('/dashboard/veg-master/list')])
  }

  goToNonVegList(){
    this.router.navigate([('/dashboard/non-veg-master/list')])
  }
}
