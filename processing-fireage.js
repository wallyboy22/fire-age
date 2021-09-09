  
// TIER 2 SEEG_Firedyn 
// Author: Camila Silva, Aline Pontes-Lopes, Wallace Silva
// Last Edited:  09 September 2021
// Institution: IPAM

//__________________________________________________________________________________________________________
// Fire Age modeling calculated year by year



var scars = 'projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-annual-burned-coverage-1';

scars = ee.Image(scars);

var bandNames = ee.List.sequence(1985,2020,1);

print(bandNames);
function fireAge (current, previous){
  
  // - 0th step, control variables
  // - 0º passo, variaveis de controle
  var year = ee.Number(current).int();
  var yearPost = year.add(1);

  // - 1st step, estimate the accumulated up to the year of the looping
  // 1º passo, estimar o acumulado até o ano do looping    
  // estimating list position in lopping - estimando posição da lista no lopping
  var sliceIndex = bandNames.indexOf(current);
  sliceIndex = ee.Number(sliceIndex).add(1);
  var sliceList = bandNames.slice(0,sliceIndex,1);

  // mapping list with fire images of the year - mapeando lista com as imagens de fogo do ano
  var alreadyBurned = sliceList.map(function(y){
    return scars.select([ee.String('burned_coverage_').cat(ee.Number(y).int())])
      .rename('classification');
  });
  // reducing it to a single image - reduzindo ela a uma unica imagem
  alreadyBurned = ee.ImageCollection(alreadyBurned).mosaic().byte();
  // setting uniform value on all pixels - definindo valor unifome em todos os pixels
  alreadyBurned = ee.Image(1).updateMask(alreadyBurned).byte();
  
  // - 2nd step, estimate what burned in the year of looping
  // - 2º passo, estimar o que queimou no ano do looping    
  var burnedThisYear = ee.Image(1).updateMask(scars.select([ee.String('burned_coverage_').cat(year)]))
    .byte();
  
  // - 3rd step, add one to all the areas that have already caught fire in previous years
  // - 3º passo, somar um a todas as areas que ja pegaram fogo em anos anteriores
  var newImage = ee.Image(previous)
    .select(ee.String('classification_').cat(year))
    .add(alreadyBurned).byte();

  
  // - 4th step, mask the areas that caught fire this year
  // - 4º passo, mascarar as areas que pegaram fogo este ano
    newImage = newImage.blend(burnedThisYear);


  return ee.Image(previous)
    .addBands(
      newImage.rename(ee.String('classification_').cat(yearPost))
    );
 
}

var first = ee.Image(0).mask(0).rename('classification_1985');
// var first = ee.Image(0).mask(0).rename('burned_coverage_1985');

var fireAgeImage = bandNames.iterate(fireAge,first);

fireAgeImage = ee.Image(fireAgeImage);

print(fireAgeImage);

// //  --- --- --- --- --- ---  ----  --- ---  --- ---  ---  ---  ---  ---  --- --- ---

var palette = [
  ['ffffff','F8D71F','DAA118','BD6C12','9F360B','810004','4D0709'],
  ['001219','000080','0000ff','0a9396','005f73','94d2bd','ee9b00','ca6702','bb3e03','ae2012','9b2226','800000']
];
palette = palette[1];



var visParams = {
  bands:['classification_2020'],
  min:1,
  max:36,
  palette:palette.reverse()
};

Map.addLayer(fireAgeImage,visParams,'idade do fogo');

var description = 'projects/mapbiomas-workspace/FOGO1/fire-age-v1';

var bands = fireAgeImage.bandNames().slice(1);

print(bands);

Export.image.toAsset({
  image:fireAgeImage.select(bands),
  description:description,
  assetId:description,
  // pyramidingPolicy:,
  // dimensions:,
  region:geometry,
  scale:30,
  // crs:,
  // crsTransform:,
  maxPixels:1e13,
  // shardSize:
}); 
