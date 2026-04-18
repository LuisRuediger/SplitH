package com.tcc.splith.service;

import com.tcc.splith.dto.statement.ParsedTransactionDTO;
import com.tcc.splith.service.strategy.StatementProcessorStrategy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class StatementImportService {

    // O Spring Boot é inteligente o suficiente para encontrar TODAS as classes
    // no projeto que implementam a interface StatementProcessorStrategy
    // e injetá-las automaticamente dentro desta lista!
    private final List<StatementProcessorStrategy> strategies;

    // Construtor para injeção de dependência
    public StatementImportService(List<StatementProcessorStrategy> strategies) {
        this.strategies = strategies;
    }

    /**
     * Método principal que será chamado pelo Controller
     */
    public void importStatement(MultipartFile file, String bankCode) {

        // 1. Procura na lista qual é a classe certa para esse banco
        StatementProcessorStrategy processor = strategies.stream()
                .filter(strategy -> strategy.supports(bankCode))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Formato de banco não suportado: " + bankCode));

        // 2. Processa o arquivo usando a classe correta que foi encontrada
        List<ParsedTransactionDTO> transactions = processor.process(file);

        // 3. Imprime no console apenas para termos certeza que funcionou (temporário)
        System.out.println("Foram encontradas " + transactions.size() + " transações no arquivo!");
        for (ParsedTransactionDTO t : transactions) {
            System.out.println(t.getDate() + " | " + t.getDescription() + " | R$ " + t.getAmount());
        }

        // 4. (Próximos passos) A partir daqui, você mapeará os DTOs para a sua Entidade 'Transaction'
        // e salvará no banco de dados usando o seu 'TransactionRepository'.
    }
}