package com.tcc.splith.service.strategy;

import com.tcc.splith.dto.statement.ParsedTransactionDTO; // Ajuste o import conforme a sua pasta
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface StatementProcessorStrategy {

    /**
     * O Spring vai perguntar para cada classe: "Você sabe ler o arquivo deste banco?"
     * Se for o banco/formato certo (ex: "NUBANK_CSV"), a classe responde 'true'.
     */
    boolean supports(String bankCode);

    /**
     * Aqui é onde a leitura real do arquivo vai acontecer.
     * Recebe o arquivo físico e devolve a lista padronizada de DTOs.
     */
    List<ParsedTransactionDTO> process(MultipartFile file);
}