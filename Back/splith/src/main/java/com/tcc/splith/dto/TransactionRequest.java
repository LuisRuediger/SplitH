package com.tcc.splith.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TransactionRequest(
        String description,
        BigDecimal amount,
        LocalDate date,
        String type,
        String category, // Adicionado para resolver o erro da linha 38
        String account,  // Adicionado para resolver o erro da linha 39
        String groupName,
        List<Long> participantIds
) {}