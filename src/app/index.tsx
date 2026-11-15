import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Gasto {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
}

export default function Home() {
  const [telaAtual, setTelaAtual] = useState<'lista' | 'formulario'>('lista');
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('');
  const [erro, setErro] = useState('');

   useEffect(() => {
    carregarGastos();
  }, []);
  async function carregarGastos() {
    const dadosSalvos = await AsyncStorage.getItem('@gastos');
    if (dadosSalvos) {
      setGastos(JSON.parse(dadosSalvos));
    }
  }
  async function atualizarBanco(novaLista: Gasto[]) {
    setGastos(novaLista);
    await AsyncStorage.setItem('@gastos', JSON.stringify(novaLista));
  }
  function salvarGasto() {
    const valorNumero = parseFloat(valor.replace(',', '.'));
    if (descricao.trim() === '' || isNaN(valorNumero) || valorNumero <= 0) {
      setErro('Digite uma descrição e um valor maior que zero!');
      return;
    }
    const novoItem: Gasto = {
      id: Date.now().toString(),
      descricao: descricao.trim(),
      valor: valorNumero,
      tipo: tipo.trim()
    };
    atualizarBanco([...gastos, novoItem]);
    setDescricao('');
    setValor('');
    setTipo('');
    setErro('');
    setTelaAtual('lista');
  }
  function excluirGasto(id: string) {
    const listaSemOItem = gastos.filter((item) => item.id !== id);
    atualizarBanco(listaSemOItem);
  }
  const totalAcumulado = gastos.reduce((soma, item) => soma + item.valor, 0);

   if (telaAtual === 'formulario') {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Novo Gasto</Text>
        <TextInput
          style={styles.input}
          placeholder="Descrição do gasto"
          value={descricao}
          onChangeText={setDescricao}
        />
        <TextInput
          style={styles.input}
          placeholder="Valor"
          keyboardType="numeric"
          value={valor}
          onChangeText={setValor}
        />
        <TextInput
          style={styles.input}
          placeholder="Tipo"
          value={tipo}
          onChangeText={setTipo}
        />
        {erro !== '' && <Text style={styles.erro}>{erro}</Text>}
        <TouchableOpacity style={styles.botao} onPress={salvarGasto}>
          <Text style={styles.textoBotao}>Salvar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Total Gasto: R$ {totalAcumulado.toFixed(2)}</Text>
      <TouchableOpacity style={styles.botao} onPress={() => setTelaAtual('formulario')}>
        <Text style={styles.textoBotao}>Adicionar Gasto</Text>
      </TouchableOpacity>
      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.item_descricao}>{item.descricao} - R$ {item.valor.toFixed(2)} - {item.tipo}</Text>
            <TouchableOpacity onPress={() => excluirGasto(item.id)}>
              <Text style={styles.excluir}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, fontFamily: 'Arial' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, width: '50%', height:50 },
  botao: { backgroundColor: 'blue', alignItems: 'center', marginBottom: 15, borderRadius: 12, width:250, height:50, justifyContent: 'center' },
  textoBotao: { color: 'white', fontWeight: 'bold' },
  erro: { color: 'red', marginBottom: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1 },
  item_descricao: { fontSize: 18, fontFamily: 'Arial' },
  excluir: { color: 'red', fontWeight: 'bold' },
});