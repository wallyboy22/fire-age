  
// TIER 2 SEEG_Firedyn 
// Author: Camila Silva, Aline Pontes-Lopes, Wallace Silva
// Last Edited:  09 September 2021
// Institution: IPAM

//__________________________________________________________________________________________________________
// View fire age on asset

var fireAge = ee.Image('projects/mapbiomas-workspace/FOGO1/mapbiomas-fire-collection1-fire-age-v1')
var scars = ee.Image('projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-annual-burned-coverage-1');

var palette = [
  ['ffffff','F8D71F','DAA118','BD6C12','9F360B','810004','4D0709'],
  ['001219','000080','0000ff','0a9396','005f73','94d2bd','ee9b00','ca6702','bb3e03','ae2012','9b2226','800000']
];

var visParams = {
  bands:['classification_2020'],
  min:1,
  max:36,
  palette:palette[1].reverse()
};

Map.addLayer(fireAge,visParams,'idade do fogo em 2021');


// --- frequencia

visParams = {
  bands:['fire_frequency_1985_2020'],
  min:1,
  max:36,
  palette:palette[0]
};


var frequence = 'projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-fire-frequency-1';

frequence = ee.Image(frequence).divide(100).int();

var years = ee.List.sequence(1985,2020,1).getInfo();
var bands = years.map(function(year){ return 'fire_frequency_1985_' + year});

Map.addLayer(frequence.select(bands),visParams,'frequence');

// --- --- animação ano a ano
var animation = require('users/gena/packages:animation');
var collection = ee.List(scars.bandNames()).map(function(bandName){
    return scars.select([bandName])
      .set({label:bandName});
  });

print(collection);
// animation.animate(collection, {label: 'label', maxFrames: 60});


// //  --- --- --- color bar

function colorbar (palette,listStrings,title){
          // Create the color bar for the legend.
          var colorBar = ui.Thumbnail({
            image: ee.Image.pixelLonLat().select(0),
            params: {
              bbox: [0, 0, 1, 0.1],
              dimensions: '100x10',
              format: 'png',
              min: 0,
              max: 1,
              palette: palette,
            },
            style: {
              stretch: 'horizontal',
              maxHeight: '6px',
              width:'250px',
              fontSize:'11px',
              margin:'0 0 0 0',
              backgroundColor:'ffffffdd'
              
            },
          });
          // Create a panel with three numbers for the legend.
          
          var legendLabels = ui.Panel({
            widgets: [
              ui.Label(listStrings[0], {fontSize:'10px',margin:'0 0 0 0',backgroundColor:'ffffffdd'}),
              ui.Label(listStrings[1], {fontSize:'10px',margin:'0 0 0 0', textAlign: 'center', stretch: 'horizontal',backgroundColor:'ffffffdd'}),
              ui.Label(listStrings[2], {fontSize:'10px',margin:'0 0 0 0',backgroundColor:'ffffffdd'})
            ],
            layout: ui.Panel.Layout.flow('horizontal'),
            style: {
              backgroundColor:'ffffffdd'
              
            },
          });
          var titleColorBar = ui.Label({
            value: title,
            style: {
              fontWeight: 'bold',
              fontSize:'12px',
              margin:'0 0 0 0',
              backgroundColor:'ffffffdd'
              
            }
          });
          return ui.Panel([titleColorBar, colorBar, legendLabels],ui.Panel.Layout.flow('vertical'));
  }

var panel = ui.Panel({
  widgets:colorbar(palette[1],['+ recente','','+ antigo'],'tempo desde de o ultimo evento de fogo'),
  layout:ui.Panel.Layout.Flow('vertical'),
  style:{
    margin:'0 0 0 0',
    backgroundColor:'ffffffdd',
    position:'bottom-left',
  }
});

Map.add(panel);
//  --- --- --- --- --- ---  ----  --- ---  --- ---  ---  ---  ---  ---  --- --- ---
var panel = ui.Panel({
  widgets:colorbar(palette[0],['menor frequencia','','maior frequencia'],'frequencia do fogo'),
  layout:ui.Panel.Layout.Flow('vertical'),
  style:{
    margin:'0 0 0 0',
    backgroundColor:'ffffffdd',
    position:'bottom-left',
  }
});

Map.add(panel);
//  --- --- --- --- --- ---  ----  --- ---  --- ---  ---  ---  ---  ---  --- --- ---

