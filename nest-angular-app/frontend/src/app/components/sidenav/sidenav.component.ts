import {Component, OnInit} from '@angular/core';

@Component({
	selector: 'app-sidenav',
	templateUrl: './sidenav.component.html',
	styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit
{

	constructor() { }

	ngOnInit(): void
	{
	}

	toggleSideNav()
	{
		// ! Means that we know for sure elt wont be null
		document.querySelector('.sidenav')!.classList.toggle('hidden');
		document.querySelector('.sidenav-toggle')!.classList.toggle('hidden');

	}
}
