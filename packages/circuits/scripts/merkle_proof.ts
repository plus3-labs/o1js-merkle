import { DataMerkleWitness, DUMMY_FIELD } from '../src';

function main() {
  console.log('test merkle proof');

  const dto = {
    commitment:
      '20520108244406485857950123757550581788960680908630507722340491031217391541989',
    leafIndex: 1,
    paths: [
      '20986126668493993398462131840061171016507078919388209941587242801436282410610',
      '18980163016836996708769109063602603701221527860016003974468540652907280820861',
      '12207336866213509213769668996810513132976934669459712067364997694687161471707',
      '544619463418997333856881110951498501703454628897449993518845662251180546746',
    ],
  };

  const witness = DataMerkleWitness.fromMerkleProofDTO(dto);

  console.log('witness: ', DataMerkleWitness.toJSON(witness));

  const witness2 = DataMerkleWitness.zero(DUMMY_FIELD);
  console.log('witness2', DataMerkleWitness.toJSON(witness2));
}

main();
