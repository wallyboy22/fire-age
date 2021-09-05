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
  
  [ ] - script em JS utilizado para gerar asset no GEE
  
  [ ] - endereço e descrição do dado 
  
  [ ] - script explorando a visualização do dado
  
  [ ] - gifs e mapas explorando o dado


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
  - O dado de idade inicia no segundo ano da série de cicatrizes 
  - Todos os pixels marcados como cicatriz no ano anterior recebem valor 1 no ano corrente do dado de idade
  - Os pixeis que ja registraram ocorrência de fogo em anos anteriores, mas não no ano anterior somam 1

- Representação simples da interação entre imagens de cicatrizes e idade, representadas como tabelas de 2 colunas por 3 linhas:

Cicatrizes em 2000 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |1 | 0
linha 3 |0 | 0

Idade      em 2000 | A   | B
---------|--------- | ------
linha 1 |0 | 0
linha 2 |0 | 0
linha 3 |0 | 0

Cicatrizes em 2001 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |0 | 0
linha 3 |0 | 0

Idade      em 2001 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |1 | 0
linha 3 |0 | 0

Cicatrizes em 2002 | A   | B
---------|--------- | ------
linha 1 |0 | 0
linha 2 |0 | 0
linha 3 |0 | 1

Idade      em 2002 | A   | B
---------|--------- | ------
linha 1 |0 | 1
linha 2 |2 | 0
linha 3 |0 | 0

Cicatrizes em 2003 | A   | B
---------|--------- | ------
linha 1 |0 | 0
linha 2 |0 | 0
linha 3 |0 | 0

Idade      em 2003 | A   | B
---------|--------- | ------
linha 1 |0 | 2
linha 2 |3 | 0
linha 3 |0 | 1


***4. Estrategia de processamento no Google Earth Engine***

- Construir uma coleção de imagens de cicatrizes de fogo e iterar uma função sobre os elementos da lista, consideranto o retorno da função aplicada ao elemento anterior.
nota: Essa estratégia é possivel por meio da estrutura de repetição .iterate(), que recebe como argumento uma função e um objeto (opicional) como estado inicial.

- A função, escrita pelo usuario, deve considerar dois argumentos, o elemento da lista e o valor de retorno da iteração anterior. 

- O estado inicial da função, é utilizado para configurar uma espécie de "pré-retorno", utilizado como  argumento de entrada da função na passagem pelo primento elemento da lista

- Obs 1: não é possivel debugar a função com print, como alternativa é necessario programar um retorno valido a analisar ele.

- Obs 2: O gee parece "esquecer" os tipo dos objetos quando dentro de funções, sendo necessario redeclarar os seus tipos.

- Analisar o resultado em memoria e exportar para um endereço de asset valido e compartilhado
-  
***5. Script no Google Earth Engine***

