###### fire-age repository

 
### Instituto de Pesquisa Ambiental da Amazônia - IPAM
### 04 de setembro de 2021, Brasilia, Distrito Federal, Brasil. 
 
##### MODELAGEM DA IDADE DO FOGO COM DADOS MAPBIOMAS FOGO
 
 
 Camila Silva e Wallace Silva
 
 contato: wallace.silva@ipam.org.br


***1. objetivo***

Compor série temporal da idade do fogo desde a ultima ocorrência anual de cicatrizes, segundo a série do MapBiomas-Fogo col. 1 - 1985 a 2020, com a finalidade de servir como input na uma modelagem de emissões de carbono do SEEG.
  
***2. conteudo do repósitorio***

Este repositório guarda os passos para composição do dado de idade do fogo, contendo de fato:
  
  [x] - modelo lógico, utilizado como referencia para construção do script
  
  [x] - planejamento da estratégia de processamento no GEE
  
  [x] - script em JS utilizado para gerar asset no GEE
  
  [x] - endereço e descrição do dado 
  
  [x] - script explorando a visualização do dado
  
  [x] - gifs e mapas explorando o dado
  
  [x] - dados de área no datastudio


***3. Modelo de idade do fogo***


A idade do fogo é a contagem anual desde o ultimo evento de fogo, sendo calculada a partir dos dados de cicatrizes dos anos anteriores


Para processar este dado foi utilizado o dado publico do MapBiomas-Fogo .col 1, no seguinte asset do GEE:

```
projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-annual-burned-coverage-1
```

Este asset armazena a distribuição espacial e o tipo de cobertura queimada no anualmente no Brasil entre 1985 a 2020.
Esta armazenado como um objeto ee.Image do tipo inteiro, possui 36 bandas chamadas "burned_coverage_yyyy", sendo yyyy um ano valído na série.
Os pixels não mascarados possuem valores de 3 a 49, referentes ao tipo de cobertura queimada naquele ano segundo o dado de uso e cobertura do solo do MapBiomas
.col 6

Para este trabalho todos os pixels não mascarados são remapeados para terem valor 1

- A interação ano a ano foram desenhadas obdecendo as seguindo as seguintes regras
  - ***Cicatrizes*** se refere a serie de dados original e ***Idade*** se refere a saída do modelo
  - O dado de idade inicia no segundo ano da série de cicatrizes e termina um ano após o final da série
  - Os pixeis que ja registraram ocorrência de fogo ao menos uma vez em anos anteriores, somam 1
  - Todos os pixels marcados como cicatriz no ano imediatamente anterior recebem valor 1 no ano corrente do dado de idade

- Representação simples da interação entre imagens de cicatrizes e idade, representadas como tabelas de 2 colunas por 3 linhas:

Cicatrizes em 2000 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |1 | 0
linha 3 |0 | 0

Acumulado até 2000 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |1 | 0
linha 3 |0 | 0

Idade do fogo em 2000 | A   | B
---------|--------- | ------
linha 1 |0 | 0
linha 2 |0 | 0
linha 3 |0 | 0

Cicatrizes em 2001 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |0 | 0
linha 3 |0 | 0

Acumulado até 2001 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |1 | 0
linha 3 |0 | 0

Idade do fogo em 2001 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |1 | 0
linha 3 |0 | 0

Cicatrizes em 2002 | A   | B
---------|--------- | ------
linha 1 |0 | 0
linha 2 |0 | 0
linha 3 |0 | 1

Acumulado até 2000 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |1 | 0
linha 3 |0 | 1

Idade do fogo em 2002 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |2 | 0
linha 3 |0 | 0

Cicatrizes em 2003 | A   | B
---------|--------- | ------
linha 1 |0 | 0
linha 2 |0 | 0
linha 3 |0 | 0

Acumulado até 2000 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |1 | 0
linha 3 |0 | 1

Idade do fogo em 2003 | A   | B
---------|--------- | ------
linha 1 |0 | 2
linha 2 |3 | 0
linha 3 |0 | 1


***4. Estrategia de processamento no Google Earth Engine***

- Construir uma coleção de imagens de cicatrizes de fogo e iterar uma função sobre os elementos da lista, consideranto o retorno da função aplicada ao elemento anterior.
nota: Essa estratégia é possivel por meio da estrutura de repetição .iterate(), que recebe como argumento uma função e um objeto (opicional) como estado inicial.

- Passos lógicos do algoritimo em looping
   1. estimar o acumulado até o ano do looping    
   2. estimar o que queimou no ano do looping
   3. somar um a todas as areas que ja pegaram fogo em anos anteriores
   4. mascarar as areas que pegaram fogo este ano

- A saída deve ser uma imagem multibandas de 1986 a 2021

***5. Script no Google Earth Engine***



```js
var scars = 'projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-annual-burned-coverage-1';

scars = ee.Image(scars);

var bandNames = ee.List.sequence(1985,2020,1);

print(bandNames);
function fireAge (current, previous){
  
  // - 0º passo, variaveis de controle
  var year = ee.Number(current).int();
  var yearPost = year.add(1);

  // - 1º passo, estimar o acumulado até o ano do looping    
  // estimando posição da lista no lopping
  var sliceIndex = bandNames.indexOf(current);
  sliceIndex = ee.Number(sliceIndex).add(1);
  var sliceList = bandNames.slice(0,sliceIndex,1);

  // mapeando lista com as imagens de fogo do ano
  var alreadyBurned = sliceList.map(function(y){
    return scars.select([ee.String('burned_coverage_').cat(ee.Number(y).int())])
      .rename('classification');
  });
  // reduzindo ela a uma unica imagem
  alreadyBurned = ee.ImageCollection(alreadyBurned).mosaic().byte();
  // definindo valor unifome em todos os pixels
  alreadyBurned = ee.Image(1).updateMask(alreadyBurned).byte();
  
  // - 2º passo, estimar o que queimou no ano do looping    
  var burnedThisYear = ee.Image(1).updateMask(scars.select([ee.String('burned_coverage_').cat(year)]))
    .byte();

  // - 3º passo, somar um a todas as areas que ja pegaram fogo em anos anteriores
  var newImage = ee.Image(previous)
    .select(ee.String('classification_').cat(year))
    .add(alreadyBurned).byte();

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

```

-
***Dados principais - Mapbiomas Fogo col. 1***: 

- asset final 
```projects/mapbiomas-workspace/FOGO1/mapbiomas-fire-collection1-fire-age-v1```


***obs:*** os foram repetidos para os outros dados de cicatrizes apresentados a baixo:
Dado de referencia MCD64A1 
```projects/mapbiomas-workspace/FOGO1/internal-version-esa-mcd64a1-fire-age-v1```

Dado de referencia FireCCI
```projects/mapbiomas-workspace/FOGO1/internal-version-esa-firecci-fire-age-v1```

Dado de referencia FIRMS
```projects/mapbiomas-workspace/FOGO1/internal-version-esa-firms-fire-age-v1```


***Gif dos dados de idade do fogo sobre Rondonia-BR***
![GIF da Idade do Fogo de 1986 a 2021 Sobre Rondonia e norte do Mato Grosso](url da imagem gerado pelo serviço de hospedagem ou GitHub)

***Link para Google Data Studio***
Com a informação da série temporal de idade cruzada com Unidades Federativas e Biomas e extraida para tabelas
```https://datastudio.google.com/reporting/750cadfb-5812-4f21-8573-0ca7af573f45/page/idcZC```

