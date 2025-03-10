import { LightningElement, api, wire, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { NavigationMixin } from 'lightning/navigation';
import getMainCategoriesWithImages from '@salesforce/apex/CarrousselDataProviders.getMainCategoriesWithImages';

import jQuery from '@salesforce/resourceUrl/jquery';
import SlickJS from '@salesforce/resourceUrl/slickJS';
import SlickCSS from '@salesforce/resourceUrl/slickCSS';

export default class ProductCaroussel extends NavigationMixin(LightningElement) {
    @api title;
    @api subtitle;
    slickInitialized = false;
    @track isLoading = false;
    @api carrousselType;
    
    // apis = [];

    categories = [];

    @wire(getMainCategoriesWithImages)
    wiredGetMainCategoriesWithImages({ error, data }) {
        if (data) {
            this.categories = data;
            console.log('======categories',this.categories)
        } else if (error) {
            console.error('Erro ao buscar categorias:', error);
        }
    }


    navigateToCategory(event) {
        const categoryId = event.target.dataset.categoryId;
        this.isLoading = true;

        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/portaldeapis/category/nossas-apis/${categoryId}`
            }
        });
        setTimeout(() => {
            this.isLoading = false;
        }, 2500);
    }

    // exemplo:
    // apis = [
    //     {
    //         id: '1',
    //         title: 'Titulo',
    //         description: 'Descrição produto',
    //         image: '/<nome org>/sfsites/c/cms/delivery/media/<content Key>',
    //         higherPrice: 'R$600,00',
    //         lowerPrice: 'R$480,00',
    //         discount: '20%OFF',
    //     }
    // ];

    renderedCallback() {
        Promise.all([
            loadScript(this, jQuery),
            loadScript(this, SlickJS),
            loadStyle(this, SlickCSS),
        ])
            .then(() => {
                $(this.template.querySelector('.slick-carousel')).slick({
                    dots: false,
                    infinite: true,
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    prevArrow: '<button type="button" class="slick-prev"><svg width="25" height="25" viewBox="0 0 25 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.044 48.8994C24.6561 48.1945 25 47.2386 25 46.2418C25 45.2451 24.6561 44.2891 24.044 43.5842L7.88142 24.9773L24.044 6.37038C24.6388 5.66143 24.9679 4.7119 24.9604 3.72631C24.953 2.74072 24.6096 1.79792 24.0042 1.10097C23.3988 0.404029 22.5799 0.00870797 21.7238 0.000140194C20.8677 -0.00842376 20.0429 0.37046 19.4271 1.05519L0.955995 22.3197C0.343871 23.0246 -1.13735e-06 23.9806 -1.09378e-06 24.9773C-1.05021e-06 25.9741 0.343871 26.93 0.955996 27.6349L19.4271 48.8994C20.0394 49.6041 20.8697 50 21.7355 50C22.6013 50 23.4317 49.6041 24.044 48.8994Z" fill="#122466"/></svg></button>',
                    nextArrow: '<button type="button" class="slick-next"><svg width="25" height="25" viewBox="0 0 25 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.955999 1.10058C0.343874 1.80549 1.78664e-06 2.76143 1.74307e-06 3.75817C1.6995e-06 4.75492 0.343874 5.71085 0.955999 6.41577L17.1186 25.0227L0.955997 43.6296C0.361221 44.3386 0.0321101 45.2881 0.0395488 46.2737C0.0469893 47.2593 0.390383 48.2021 0.995771 48.899C1.60116 49.596 2.42011 49.9913 3.27622 49.9999C4.13234 50.0084 4.95713 49.6295 5.57294 48.9448L24.044 27.6803C24.6561 26.9754 25 26.0194 25 25.0227C25 24.0259 24.6561 23.07 24.044 22.3651L5.57295 1.10058C4.96064 0.395877 4.13028 -9.12245e-07 3.26447 -9.5009e-07C2.39867 -9.87936e-07 1.56831 0.395877 0.955999 1.10058Z" fill="#122466"/></svg></button>',
                });
            })
            .catch(error => {
                console.error('Error loading SlickJS:', error);
            });
    }

    async renderedCallback() {
        if (this.slickInitialized) {
            return;
        }
        this.slickInitialized = true;

        try {
            // Use await para carregar scripts e estilos
            await loadScript(this, jQuery);
            await loadScript(this, SlickJS);
            await loadStyle(this, SlickCSS);

            // Inicialize o Slick.js após os scripts serem carregados
            this.initializeSlickCarousel();
        } catch (error) {
            console.error('Erro ao carregar recursos do Slick.js:', error);
        }
    }

    initializeSlickCarousel() {
        const slickCarousel = this.template.querySelector('.slick-carousel');

        if (slickCarousel) {
            $(slickCarousel).slick({
                dots: false,
                infinite: true,
                slidesToShow: 4,
                slidesToScroll: 1,
                prevArrow: '<button type="button" class="slick-btn slick-prev"><svg width="25" height="25" viewBox="0 0 25 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.044 48.8994C24.6561 48.1945 25 47.2386 25 46.2418C25 45.2451 24.6561 44.2891 24.044 43.5842L7.88142 24.9773L24.044 6.37038C24.6388 5.66143 24.9679 4.7119 24.9604 3.72631C24.953 2.74072 24.6096 1.79792 24.0042 1.10097C23.3988 0.404029 22.5799 0.00870797 21.7238 0.000140194C20.8677 -0.00842376 20.0429 0.37046 19.4271 1.05519L0.955995 22.3197C0.343871 23.0246 -1.13735e-06 23.9806 -1.09378e-06 24.9773C-1.05021e-06 25.9741 0.343871 26.93 0.955996 27.6349L19.4271 48.8994C20.0394 49.6041 20.8697 50 21.7355 50C22.6013 50 23.4317 49.6041 24.044 48.8994Z" fill="#122466"/></svg></button>',
                nextArrow: '<button type="button" class="slick-btn slick-next"><svg width="25" height="25" viewBox="0 0 25 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.955999 1.10058C0.343874 1.80549 1.78664e-06 2.76143 1.74307e-06 3.75817C1.6995e-06 4.75492 0.343874 5.71085 0.955999 6.41577L17.1186 25.0227L0.955997 43.6296C0.361221 44.3386 0.0321101 45.2881 0.0395488 46.2737C0.0469893 47.2593 0.390383 48.2021 0.995771 48.899C1.60116 49.596 2.42011 49.9913 3.27622 49.9999C4.13234 50.0084 4.95713 49.6295 5.57294 48.9448L24.044 27.6803C24.6561 26.9754 25 26.0194 25 25.0227C25 24.0259 24.6561 23.07 24.044 22.3651L5.57295 1.10058C4.96064 0.395877 4.13028 -9.12245e-07 3.26447 -9.5009e-07C2.39867 -9.87936e-07 1.56831 0.395877 0.955999 1.10058Z" fill="#122466"/></svg></button>',
                responsive: [
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        }
    }
}
