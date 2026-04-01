package com.tcc.splith.repository;

import com.tcc.splith.entity.Transaction;
import com.tcc.splith.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // O Spring cria o SQL sozinho só de ler esse nome!
    List<Transaction> findByUserOrderByIdDesc(User user);

    // Busca todas as transações de um grupo específico, ordenadas da mais nova pra mais velha
    List<Transaction> findByGroupNameOrderByIdDesc(String groupName);
}
