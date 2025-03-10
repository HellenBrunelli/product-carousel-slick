public with sharing class CarrousselDataProviders {

    @AuraEnabled(cacheable=true)
    public static List<CategoryWrapper> getMainCategoriesWithImages() {
        try {
            // Buscar a categoria raiz "Nome Categoria Raiz"
            ProductCategory rootCategory = [
                SELECT Id FROM ProductCategory WHERE Name = '<Nome categoria raiz>' LIMIT 1
            ];

            if (rootCategory == null) {
                throw new AuraHandledException('Categoria raiz não encontrada.');
            }

            // Buscar categorias principais (filhas da raiz)
            List<ProductCategory> mainCategories = [
                SELECT Id, Name, Description 
                FROM ProductCategory 
                WHERE ParentCategoryId = :rootCategory.Id 
                ORDER BY Name ASC
            ];

            // Obter IDs das categorias principais
            List<String> categoryIds = new List<String>();
            for (ProductCategory cat : mainCategories) {
                categoryIds.add(cat.Id);
            }

            // Buscar imagens das categorias
            List<CategoryWrapper> categoryList = new List<CategoryWrapper>();
            Map<String, String> categoryImages = getCategoryImages(categoryIds);

            // Montar lista de categorias com imagens
            for (ProductCategory cat : mainCategories) {
                CategoryWrapper wrapper = new CategoryWrapper();
                wrapper.Id = cat.Id;
                wrapper.Name = cat.Name;
                wrapper.Description = cat.Description;
                wrapper.ImageUrl = categoryImages.containsKey(cat.Id) ? categoryImages.get(cat.Id) : null;
                categoryList.add(wrapper);
            }

            return categoryList;

        } catch (Exception e) {
            throw new AuraHandledException('Erro ao buscar categorias com imagens: ' + e.getMessage());
        }
    }

    private static Map<String, String> getCategoryImages(List<String> categoryIds) {
        Map<String, String> imageMap = new Map<String, String>();

        if (categoryIds.isEmpty()) {
            return imageMap;
        }

        List<ManagedContentChannel> channels = [SELECT Id FROM ManagedContentChannel WHERE Name = '<org name> Channel' LIMIT 1];
        if (channels.isEmpty()) {
            return imageMap;
        }

        String channelId = channels[0].Id;

        List<ProductCategoryMedia> categoryMediaList = [
            SELECT ProductCategoryId, ElectronicMediaId
            FROM ProductCategoryMedia
            WHERE ProductCategoryId IN :categoryIds
        ];

        for (ProductCategoryMedia media : categoryMediaList) {
            try {
                ConnectApi.ManagedContentDeliveryDocumentCollection resp = ConnectApi.ManagedContentDelivery.getManagedContentsForChannel(
                    channelId,
                    new List<String>{ media.ElectronicMediaId }, 
                    null, null, null, null, null, 
                    false, 1, false, false, null, 1, false
                );

                if (resp.contents != null && !resp.contents.isEmpty()) {
                    String contentKey = String.valueOf(resp.contents[0].contentKey);
                    String imageUrl = '/fsl/sfsites/c/cms/delivery/media/' + contentKey;
                    imageMap.put(media.ProductCategoryId, imageUrl);
                }
            } catch (Exception e) {
                System.debug('Erro ao buscar imagem da categoria: ' + e.getMessage());
            }
        }

        return imageMap;
    }

    public class CategoryWrapper {
        @AuraEnabled public String Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String Description;
        @AuraEnabled public String ImageUrl;
    }
}
